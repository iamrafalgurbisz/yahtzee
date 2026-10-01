import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { generateApiTypes } from "./openapi/generate-api-types";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Yahtzee API").build(),
    { operationIdFactory: (_controller, method) => method },
  );
  SwaggerModule.setup("api/docs", app, document);

  if (process.env.NODE_ENV !== "production") {
    await generateApiTypes(document);
  }

  app.enableCors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3001",
    credentials: true,
  });
  app.use(cookieParser());
  app.useSecurityHeaders();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
