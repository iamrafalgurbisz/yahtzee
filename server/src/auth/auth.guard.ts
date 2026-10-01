import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public";
import { UsersService } from "../users/users.service";
import { ERROR_CODE } from "@shared/types/error_code";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.#extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        message: "No token",
        code: ERROR_CODE.NO_TOKEN,
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      request["user"] = payload;
    } catch {
      throw new UnauthorizedException({
        message: "Invalid token",
        code: ERROR_CODE.INVALID_TOKEN,
      });
    }

    return true;
  }

  #extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type === "Bearer") {
      return token;
    }

    return request.cookies?.access_token;
  }
}
