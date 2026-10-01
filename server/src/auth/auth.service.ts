import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ref } from "process";
import { PG_POOL } from "../db/db.module";
import { Pool } from "pg";
import { MeResponseDto } from "./dto/me.dto";
import { ERROR_CODE } from "@shared/types/error_code";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PG_POOL) private db: Pool,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getMe(userUuid: string) {
    const { rows } = await this.db.query<MeResponseDto>(
      `SELECT * FROM users WHERE users.uuid = $1`,
      [userUuid],
    );

    const user = rows[0];

    if (!user) {
      throw new InternalServerErrorException({
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

    const accessToken = await this.jwtService.signAsync({
      sub: user.uuid,
    });

    const refreshToken = await this.usersService.issue(user.uuid);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(dto: RegisterDto): Promise<any> {
    const passwordHash = await argon2.hash(dto.password);

    return this.usersService.create(dto.email, passwordHash);
  }

  async refresh() {}
}
