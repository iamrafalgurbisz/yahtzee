import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { OpenAPIObject } from "@nestjs/swagger";

const OUTPUT = "../shared/api.d.ts";

export async function generateApiTypes(document: OpenAPIObject) {
  const { default: openapiTS, astToString } =
    await import("openapi-typescript");
  const ast = await openapiTS(
    document as unknown as Parameters<typeof openapiTS>[0],
  );
  const content = `// Auto-generated file. Do not edit.\n${astToString(ast)}`;

  if (existsSync(OUTPUT) && readFileSync(OUTPUT, "utf8") === content) return;
  writeFileSync(OUTPUT, content);
}
