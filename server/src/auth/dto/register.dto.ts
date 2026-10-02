import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  display_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
