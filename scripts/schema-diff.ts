import fs from "fs";
import path from "path";
import { QUESTION_SCHEMA_META } from "@shared/schema";

const SNAPSHOT_PATH = path.join(process.cwd(), "docs", "testing", "question-schema.snapshot.json");

function serialize(meta: unknown) {
  return JSON.stringify(meta, null, 2);
}

function main() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`[schema:check] Snapshot not found at ${SNAPSHOT_PATH}. Run npm run schema:snapshot first.`);
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf-8"));
  const current = {
    schemaMeta: QUESTION_SCHEMA_META,
  };

  const snapStr = serialize(snapshot.schemaMeta);
  const currentStr = serialize(current.schemaMeta);

  if (snapStr !== currentStr) {
    console.error("[schema:check] Schema metadata changed:");
    console.error("---- snapshot ----");
    console.error(snapStr);
    console.error("---- current ----");
    console.error(currentStr);
    process.exit(1);
  }

  console.log("[schema:check] Schema matches snapshot.");
}

main();
