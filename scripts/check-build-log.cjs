#!/usr/bin/env node
/**
 * Simple guard: fail if core code is staged without updating docs/BUILD_LOG.md.
 * CJS-compatible for node invocations in any env.
 */
const { execSync } = require("child_process");

const changed = execSync("git diff --cached --name-only", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const coreTouched = changed.some((f) =>
  /^(client\/src|server\/|shared\/|src\/core\/|docs\/ARCHITECTURE)/.test(f)
);
const buildLogTouched = changed.some((f) => f === "docs/BUILD_LOG.md");

if (coreTouched && !buildLogTouched) {
  console.error("✖ Core files changed but docs/BUILD_LOG.md was not updated.");
  console.error("  Please add a short entry to docs/BUILD_LOG.md and stage it.");
  process.exit(1);
}

process.exit(0);
