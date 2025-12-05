-- [SCORE-001] Score Config Versioning
-- Creates table for immutable scoring config snapshots
-- Adds reference from survey_responses to enable historical score stability

-- Create score_config_versions table
CREATE TABLE IF NOT EXISTS "score_config_versions" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "survey_id" VARCHAR NOT NULL REFERENCES "surveys"("id"),
  "version_number" INTEGER NOT NULL,
  "config_snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup by survey
CREATE INDEX IF NOT EXISTS "idx_score_config_versions_survey" ON "score_config_versions" ("survey_id");

-- Unique constraint: one version number per survey
CREATE UNIQUE INDEX IF NOT EXISTS "idx_score_config_versions_unique" ON "score_config_versions" ("survey_id", "version_number");

-- Add score_config_version_id to survey_responses
ALTER TABLE "survey_responses" 
ADD COLUMN IF NOT EXISTS "score_config_version_id" VARCHAR REFERENCES "score_config_versions"("id");

-- Index for responses lookup by version
CREATE INDEX IF NOT EXISTS "idx_survey_responses_score_config_version" ON "survey_responses" ("score_config_version_id");

-- Comment for documentation
COMMENT ON TABLE "score_config_versions" IS 'Immutable snapshots of scoring configuration at publish time. Responses reference these versions so historical scores remain stable when scoring config is edited.';
COMMENT ON COLUMN "score_config_versions"."version_number" IS 'Auto-incrementing version number per survey, starts at 1';
COMMENT ON COLUMN "score_config_versions"."config_snapshot" IS 'Complete SurveyScoreConfig JSON at the time of publish';

