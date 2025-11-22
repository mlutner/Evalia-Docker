// Email service for survey invitations
// Uses Resend (recommended) or SendGrid when API keys are configured

export interface EmailService {
  sendSurveyInvitation(email: string, name: string | undefined, surveyTitle: string, respondentUrl: string, trainerName?: string): Promise<boolean>;
  sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<boolean>;
}

export class MockEmailService implements EmailService {
  async sendSurveyInvitation(email: string, name: string | undefined, surveyTitle: string, respondentUrl: string): Promise<boolean> {
    console.log(`[EMAIL INVITED] ${email} ${name ? `(${name})` : ''} for survey: ${surveyTitle}`);
    console.log(`[RESPONDENT LINK] ${respondentUrl}`);
    return false;
  }

  async sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<boolean> {
    console.log(`[EMAIL REMINDER] ${email} for survey: ${surveyTitle}`);
    console.log(`[RESPONDENT LINK] ${respondentUrl}`);
    return false;
  }
}

// Resend implementation (recommended)
export class ResendEmailService implements EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
  }

  async sendSurveyInvitation(email: string, name: string | undefined, surveyTitle: string, respondentUrl: string, trainerName?: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("RESEND_API_KEY not configured. Email invitation not sent.");
      return false;
    }

    try {
      const greeting = name ? `Hi ${name}` : "Hello";
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1a1a1a; margin-bottom: 16px;">${greeting},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${trainerName ? `<strong>${trainerName}</strong> has` : 'You have been'} invited to participate in a survey:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 16px; border-left: 4px solid #3b82f6; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #3b82f6;">${surveyTitle}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Take a few minutes to share your feedback. Your responses are valuable and will help improve the training.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${respondentUrl}" style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Start Survey
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            This is a personalized survey link just for you. If you have any questions, please contact the survey creator.
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 16px;">
            Survey powered by Evalia
          </p>
        </div>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@evalia.replit.dev",
          to: email,
          subject: `You're invited: ${surveyTitle}`,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend API error:", error);
        return false;
      }

      const data: any = await response.json();
      console.log(`✓ [RESEND] Invitation email sent to ${email} (ID: ${data.id})`);
      return true;
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return false;
    }
  }

  async sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn("RESEND_API_KEY not configured. Email reminder not sent.");
      return false;
    }

    try {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1a1a1a;">Quick reminder</h2>
          <p style="font-size: 16px; line-height: 1.6;">You haven't yet submitted your response to: <strong>${surveyTitle}</strong></p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${respondentUrl}" style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Complete Survey
            </a>
          </div>
          <p style="font-size: 12px; color: #999;">Survey powered by Evalia</p>
        </div>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@evalia.replit.dev",
          to: email,
          subject: `Reminder: ${surveyTitle}`,
          html,
        }),
      });

      if (!response.ok) {
        console.error("Resend API error:", await response.text());
        return false;
      }

      console.log(`✓ [RESEND] Reminder email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Failed to send reminder via Resend:", error);
      return false;
    }
  }
}

// Use Resend if API key available, otherwise mock
const emailService = process.env.RESEND_API_KEY
  ? new ResendEmailService()
  : new MockEmailService();

export { emailService };
