import fs from "fs";
import path from "path";
import { QUESTION_SCHEMA_META } from "@shared/schema";

const OUTPUT_PATH = path.join(process.cwd(), "docs", "testing", "question-schema.snapshot.json");

function main() {
  const payload = {
    generatedAt: new Date().toISOString(),
    schemaMeta: QUESTION_SCHEMA_META,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`[schema:snapshot] Wrote ${OUTPUT_PATH}`);
}

main();
