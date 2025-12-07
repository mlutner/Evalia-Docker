# Question Parameter Matrix

Reference matrix for question types and their key parameters. Field names align with `shared/schema.ts`.

Authoritative source of parameters is `QUESTION_SCHEMA_META` in `shared/schema.ts`. Update this matrix only after schema changes have been made there.

## Core fields (all types)
- `id`, `type`, `question`, `description`, `required`
- Logic/scoring: `skipCondition`, `logicRules`, `scoringCategory`, `scoreWeight`, `optionScores`, `scorable`

## Type-specific parameters

| Question Type | Key Parameters |
| --- | --- |
| `text` | `placeholder`, `minLength`, `maxLength`, `validationPattern` |
| `textarea` | `placeholder`, `rows`, `minLength`, `maxLength` |
| `email` | `placeholder` |
| `phone` | `placeholder` |
| `url` | `placeholder` |
| `number` | `placeholder`, `min`, `max`, `step`, `unit` |
| `multiple_choice` | `options`, `displayStyle`, `allowOther`, `randomizeOptions`, `optionImages` |
| `checkbox` | `options`, `displayStyle`, `allowOther`, `randomizeOptions`, `minSelections`, `maxSelections` |
| `dropdown` | `options`, `placeholder`, `allowOther`, `randomizeOptions` |
| `image_choice` | `imageOptions`, `selectionType`, `imageSize`, `columns`, `showLabels` |
| `yes_no` | `displayStyle`, `yesLabel`, `noLabel` |
| `rating` | `ratingScale`, `ratingStyle`, `ratingLabels`, `showLabelsOnly` |
| `nps` | `npsLabels` |
| `likert` | `likertType`, `likertPoints`, `showNeutral`, `customLabels` |
| `opinion_scale` | `ratingScale`, `leftLabel`, `rightLabel`, `showNumbers` |
| `slider` | `min`, `max`, `step`, `defaultValue`, `showValue`, `unit`, `ratingLabels` |
| `emoji_rating` | `ratingScale`, `ratingStyle`, `ratingLabels` |
| `matrix` | `rowLabels`, `colLabels`, `matrixType`, `randomizeRows` |
| `ranking` | `options`, `maxRankItems` |
| `constant_sum` | `options`, `totalPoints`, `showPercentage` |
| `calculation` | _(no additional params)_ |
| `date` | `dateFormat`, `minDate`, `maxDate`, `disablePastDates`, `disableFutureDates` |
| `time` | `timeFormat`, `minuteStep` |
| `datetime` | `dateFormat`, `timeFormat`, `minuteStep` |
| `file_upload` | `allowedTypes`, `maxFileSize` (MB), `maxFiles` (count) |
| `signature` | _(no additional params)_ |
| `video` | `videoUrl`, `posterImageUrl`, `autoplay` |
| `audio_capture` | `maxDuration` (seconds) |
| `section` | `description` |
| `statement` | `description` |
| `legal` | `description`, `linkUrl`, `linkText` |
| `hidden` | _(no additional params)_ |

## Notes
- Image choice uses `imageOptions[{ imageUrl: string; label?: string; value?: string }]`. If `imageOptions` is missing, normalization can synthesize from `options` + `optionImages`.
- File upload uses `allowedTypes[]`, `maxFileSize` (MB), `maxFiles` (count).
- Audio capture `maxDuration` is in seconds; video/audio fields (`videoUrl`, `posterImageUrl`, `autoplay`, `maxDuration`) are optional.
- Hidden questions are not rendered to respondents and can carry metadata/prefilled values.
- All params are optional unless otherwise required by UX; validation is enforced via `questionSchema`.
