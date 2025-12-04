# Builder V2 Components

This directory hosts the current 3-panel survey builder experience:

- **SurveyBuilderV2 page** wires the `SurveyBuilderContext` into the layout.
- **QuestionLibrary** lists question templates and draggables for creating surveys.
- **BuilderCanvas** renders the working copy of the survey and supports reordering/selection.
- **QuestionConfigPanel** lets editors adjust question content, logic, scoring, and design.
- **BuilderActionBar** manages save/publish/preview actions across the flow.
- **ProgressFlowStepper** shows navigation between builder → design → preview.
- **WelcomePageEditor** manages welcome/thank-you surfaces.
- **SurveyDebugPanel** (dev-only) surfaces raw survey state, scoring, and logic for diagnostics.

V2 components share the `SurveyBuilderContext` to stay in sync on question updates and metadata.
