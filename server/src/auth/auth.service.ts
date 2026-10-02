import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { PG_POOL } from "../db/db.module";
import { Pool } from "pg";
import { MeResponseDto } from "./dto/me.dto";
import { ERROR_CODE } from "@shared/types/error_code";
import { MailService } from "../mail/mail.service";
import { withTransaction } from "../hoc/withTransaction";

@Injectable()
export class AuthService {
  #logger = new Logger(AuthService.name);

  constructor(
    @Inject(PG_POOL) private db: Pool,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async getMe(userUuid: string) {
    const { rows } = await this.db.query<MeResponseDto>(
      `SELECT * FROM users WHERE users.uuid = $1`,
      [userUuid],
    );

    const user = rows[0];

    if (!user) {
      throw new UnauthorizedException({
        message: "User not found",
        code: ERROR_CODE.USER_NOT_FOUND,
      });
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithHash(dto.email);

    if (!user || !(await argon2.verify(user.password_hash, dto.password))) {
      return null;
    }

    if (!user.email_verified_at) {
      throw new ForbiddenException({
        message: "Email address is not verified",
        code: ERROR_CODE.EMAIL_NOT_VERIFIED,
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.uuid,
    });

    const refreshToken = await this.usersService.issue(user.uuid);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(dto: RegisterDto): Promise<any> {
    const passwordHash = await argon2.hash(dto.password);

    const { user, token } = await withTransaction(this.db, async (client) => {
      const user = await this.usersService.create(
        dto.display_name,
        dto.email,
        passwordHash,
        client,
      );
      const token = await this.usersService.issueEmailToken(
        user.uuid,
        "email_verification",
        client,
      );

      return { user, token };
    });

    await this.#sendEmailVerification(user, token);

    return user;
  }

  async verifyEmail(token: string) {
    await withTransaction(this.db, async (client) => {
      const userUuid = await this.usersService.consumeEmailToken(
        token,
        "email_verification",
        client,
      );

      if (!userUuid) {
        throw new BadRequestException({
          message: "Invalid or expired activation link",
          code: ERROR_CODE.INVALID_EMAIL_TOKEN,
        });
      }

      await this.usersService.markEmailVerified(userUuid, client);
    });
  }

  async resendEmailVerification(email: string) {
    const user = await this.usersService.findUnverifiedByEmail(email);

    if (!user) return;

    const token = await this.usersService.issueEmailToken(
      user.uuid,
      "email_verification",
    );

    await this.#sendEmailVerification(user, token);
  }

  async #sendEmailVerification(
    user: { email: string; display_name: string },
    token: string,
  ) {
    try {
      await this.mailService.sendEmailVerification(
        user.email,
        user.display_name,
        token,
      );
    } catch (e) {
      this.#logger.error(
        `Failed to send verification email to ${user.email}`,
        e,
      );
    }
  }

  async refresh() {}
}
