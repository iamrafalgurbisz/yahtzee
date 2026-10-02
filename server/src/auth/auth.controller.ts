import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "../decorators/public";
import type { Response } from "express";
import { CurrentUser } from "../decorators/currentUser";
import { COOKIE_OPTS } from "./cookie-options";
import { ACCESS_TOKEN_TTL_SECONDS } from "./auth.constants";
import { MeResponseDto } from "./dto/me.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ERROR_CODE } from "@shared/types/error_code";
import type { User } from "@/types/user";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  async me(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MeResponseDto> {
    try {
      return await this.authService.getMe(user.sub);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        res.clearCookie("access_token", COOKIE_OPTS);
      }

      throw e;
    }
  }

  @Public()
  @Post("logout")
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", COOKIE_OPTS);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(body);

    if (!tokens) {
      throw new UnauthorizedException({
        message: "Wrong email or password",
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });
    }

    res.cookie("access_token", tokens.access_token, {
      ...COOKIE_OPTS,
      maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });

    return {
      ok: true,
    };
  }

  @Public()
  @Post("register")
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(204)
  async verifyEmail(@Body() body: VerifyEmailDto) {
    await this.authService.verifyEmail(body.token);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(204)
  async resendVerification(@Body() body: ResendVerificationDto) {
    await this.authService.resendEmailVerification(body.email);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh() {
    return await this.authService.refresh();
  }
}
