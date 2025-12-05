# Data Model

This page documents the relational schema (ERD) and key JSON structures used by Evalia.

## ERD (tables)

```mermaid
erDiagram
  users ||--o{ surveys : owns
  surveys ||--o{ survey_responses : has
  surveys ||--o{ survey_respondents : invites
  surveys ||--o{ survey_analytics_events : logs
  surveys ||--o{ short_urls : maps
  users ||--o{ sessions : has
  templates ||--o{ surveys : seededFrom

  users {
    varchar id PK
    text email
  }
  sessions {
    varchar id PK
    varchar user_id FK
    jsonb session_data
  }
  surveys {
    varchar id PK
    varchar user_id FK
    text title
    jsonb questions
    jsonb score_config
    jsonb design_settings
    varchar scoring_engine_id
    text thank_you_message
    timestamp created_at
    timestamp updated_at
  }
  survey_responses {
    varchar id PK
    varchar survey_id FK
    jsonb answers
    varchar scoring_engine_id
    timestamp started_at
    timestamp completed_at
    jsonb metadata
  }
  survey_respondents {
    varchar id PK
    varchar survey_id FK
    varchar email
    varchar name
    varchar respondent_token
  }
  templates {
    varchar id PK
    text title
    jsonb questions
    jsonb score_config
    jsonb design_settings
  }
  survey_analytics_events {
    varchar id PK
    varchar survey_id FK
    jsonb payload
  }
  short_urls {
    varchar code PK
    varchar survey_id FK
  }
```

## Key JSONB shapes

### Question
```mermaid
classDiagram
  class Question {
    +string id
    +string type
    +string question
    +bool required
    +string scoringCategory
    +number ratingScale
    +string[] options
    +map optionScores
  }
```

### ScoreConfig
```mermaid
classDiagram
  class ScoreConfig {
    +bool enabled
    +Category[] categories
    +ScoreRange[] scoreRanges
    +ResultsScreen resultsScreen
  }
  class Category {
    +string id
    +string name
  }
  class ScoreRange {
    +string id
    +number min
    +number max
    +string label
  }
```

### ResultsScreen
```mermaid
classDiagram
  class ResultsScreen {
    +bool enabled
    +string layout
    +bool showTotalScore
    +bool showPercentage
    +bool showOverallBand
    +bool showCategoryBreakdown
    +bool showCategoryBands
    +bool showStrengthsAndRisks
    +bool showCallToAction
    +string title
    +string subtitle
    +ScoreRange[] scoreRanges
    +CategoryResult[] categories
  }
  class CategoryResult {
    +string categoryId
    +string bandsMode
    +BandNarrative[] bandNarratives
  }
  class BandNarrative {
    +string bandId
    +string headline
    +string summary
  }
```

### LogicRule
```mermaid
classDiagram
  class LogicRule {
    +string condition
    +string action
    +string targetQuestionId
  }
```

### Theme / Design (normalized image fields)
```mermaid
classDiagram
  class Theme {
    +string headerImageUrl
    +string backgroundImageUrl
    +map colors
  }
```

## Notes
- Table definitions live in `shared/schema.ts`.
- JSON shapes (Question, ScoreConfig, ResultsScreen, LogicRule, Theme) are defined via Zod schemas in `shared/schema.ts` and normalized in `shared/theme.ts`.
