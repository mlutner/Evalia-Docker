import { render } from "@testing-library/react";
import { SurveyBodyPreview } from "@/pages/DesignV2";
import { DEFAULT_WELCOME_SETTINGS } from "@/components/builder-v2/WelcomePageEditor";

const baseSettings = {
  ...DEFAULT_WELCOME_SETTINGS,
  colors: {
    ...DEFAULT_WELCOME_SETTINGS.colors,
    // Ensure deterministic colors for assertions
    primary: "#123456",
    headerBar: "#123456",
    background: "#ffffff",
    text: "#000000",
  },
};

const sampleQuestions = [
  {
    id: "q1",
    type: "multiple_choice",
    text: "How satisfied are you?",
    required: true,
    options: ["Very", "Somewhat", "Not at all"],
  },
];

describe("SurveyBodyPreview image handling", () => {
  it("renders safely with no images", () => {
    const { queryByAltText, container } = render(
      <SurveyBodyPreview
        questions={sampleQuestions}
        settings={baseSettings}
        backgroundImage={null}
        headerImage={null}
      />
    );

    expect(queryByAltText(/survey header/i)).toBeNull();
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it("renders header only without applying background", () => {
    const headerUrl = "https://example.com/header.jpg";
    const { getByAltText, container } = render(
      <SurveyBodyPreview
        questions={sampleQuestions}
        settings={baseSettings}
        backgroundImage={null}
        headerImage={headerUrl}
      />
    );

    const headerImg = getByAltText(/survey header/i) as HTMLImageElement;
    expect(headerImg).toBeInTheDocument();
    expect(headerImg.src).toContain(headerUrl);
    expect(container.querySelector('[style*="background-image"]')).toBeNull();
  });

  it("renders background only without header", () => {
    const bgUrl = "https://example.com/bg.jpg";
    const { queryByAltText, container } = render(
      <SurveyBodyPreview
        questions={sampleQuestions}
        settings={baseSettings}
        backgroundImage={bgUrl}
        headerImage={null}
      />
    );

    expect(queryByAltText(/survey header/i)).toBeNull();
    const bgLayer = container.querySelector('[style*="background-image"]');
    expect(bgLayer?.getAttribute("style")).toContain(bgUrl);
  });

  it("renders both header and background when provided", () => {
    const headerUrl = "https://example.com/header.jpg";
    const bgUrl = "https://example.com/bg.jpg";
    const { getByAltText, container } = render(
      <SurveyBodyPreview
        questions={sampleQuestions}
        settings={baseSettings}
        backgroundImage={bgUrl}
        headerImage={headerUrl}
      />
    );

    const headerImg = getByAltText(/survey header/i) as HTMLImageElement;
    expect(headerImg).toBeInTheDocument();
    expect(headerImg.src).toContain(headerUrl);
    const bgLayer = container.querySelector('[style*="background-image"]');
    expect(bgLayer?.getAttribute("style")).toContain(bgUrl);
  });
});
