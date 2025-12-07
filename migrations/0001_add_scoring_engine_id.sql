ALTER TABLE "surveys"
ADD COLUMN "scoring_engine_id" varchar;

ALTER TABLE "survey_responses"
ADD COLUMN "scoring_engine_id" varchar NOT NULL DEFAULT 'engagement_v1';
