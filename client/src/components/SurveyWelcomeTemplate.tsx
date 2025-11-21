import logoImage from "@assets/Untitled design (3)_1763764996441.png";

interface SurveyWelcomeTemplateProps {
  title: string;
  description?: string;
  illustration?: string;
  welcomeMessage?: string;
  onStart: () => void;
}

export default function SurveyWelcomeTemplate({
  title,
  description,
  illustration,
  welcomeMessage,
  onStart,
}: SurveyWelcomeTemplateProps) {
  const purposePoints = welcomeMessage
    ? welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  return (
    <>
      {/* Header Section */}
      <header className="survey-header mt-[0px] mb-[0px] pt-[29px] pb-[29px]">
        {/* Logo */}
        <img 
          src={logoImage} 
          alt="Survey logo" 
          data-testid="icon-survey-logo"
          className="survey-logo-img"
        />
        {/* Title */}
        <h1
          id="survey-title"
          data-testid="text-survey-title"
          className="survey-title text-center text-[40px]">
          {title}
        </h1>
      </header>

      {/* Subtitle */}
      {description && (
        <p className="hero-subtitle ml-[40px] mr-[40px] mt-[0px] mb-[0px] text-[14px]" data-testid="text-survey-description">
          {description}
        </p>
      )}

      {/* Body */}
      <div className="survey-body">
        {/* Illustration */}
        {illustration && (
          <div className="hero-illustration">
            <img
              src={illustration}
              alt="Survey illustration"
              data-testid="img-survey-illustration"
              className="mt-[10px] mb-[10px]"
            />
          </div>
        )}

        {/* Purpose list */}
        {purposePoints.length > 0 && (
          <>
            <h2 className="hero-section-title" data-testid="text-survey-purpose">The purpose of the survey:</h2>
            <ul className="hero-benefits">
              {purposePoints.map((point, idx) => (
                <li
                  key={idx}
                  data-testid={`text-purpose-${idx}`}>
                  {point.trim()}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="survey-footer" style={{ justifyContent: 'center' }}>
        <button
          onClick={onStart}
          data-testid="button-start-survey"
          className="survey-primary mt-[10px] mb-[10px] pt-[10px] pb-[10px]"
          type="button"
        >
          Begin Survey
        </button>
      </footer>
      <p className="survey-footnote" data-testid="text-helper">
        Fast, confidential, and designed for personal growth.
      </p>
    </>
  );
}
