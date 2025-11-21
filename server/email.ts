// Email service for survey invitations
// Uses SendGrid/Resend when connected via Replit integrations

export interface EmailService {
  sendSurveyInvitation(email: string, name: string, surveyTitle: string, respondentUrl: string): Promise<void>;
  sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<void>;
}

export class MockEmailService implements EmailService {
  async sendSurveyInvitation(email: string, name: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    console.log(`[EMAIL INVITED] ${email} (${name}) for survey: ${surveyTitle}`);
    console.log(`[RESPONDENT LINK] ${respondentUrl}`);
  }

  async sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    console.log(`[EMAIL REMINDER] ${email} for survey: ${surveyTitle}`);
    console.log(`[RESPONDENT LINK] ${respondentUrl}`);
  }
}

// SendGrid implementation (when integration is set up)
export class SendGridEmailService implements EmailService {
  private apiKey: string;

  constructor() {
    // Load from Replit integration environment
    this.apiKey = process.env.SENDGRID_API_KEY || "";
    if (!this.apiKey) {
      console.warn("SendGrid API key not configured. Falling back to mock email service.");
    }
  }

  async sendSurveyInvitation(email: string, name: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    if (!this.apiKey) {
      console.warn("Cannot send email: SendGrid API key not set");
      return;
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email, name }],
              subject: `You're invited to: ${surveyTitle}`,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || "noreply@evalia.com",
            name: "Evalia Surveys",
          },
          content: [
            {
              type: "text/html",
              value: `
                <h2>Hi ${name},</h2>
                <p>You've been invited to participate in: <strong>${surveyTitle}</strong></p>
                <p><a href="${respondentUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2BB4A0; color: white; text-decoration: none; border-radius: 5px;">Start Survey</a></p>
                <p>This survey should take just a few minutes to complete.</p>
                <p>Thank you for your feedback!</p>
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.statusText}`);
      }

      console.log(`[SENDGRID] Email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send email via SendGrid:", error);
      throw error;
    }
  }

  async sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    if (!this.apiKey) {
      console.warn("Cannot send email: SendGrid API key not set");
      return;
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email }],
              subject: `Reminder: ${surveyTitle}`,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || "noreply@evalia.com",
            name: "Evalia Surveys",
          },
          content: [
            {
              type: "text/html",
              value: `
                <h2>Quick reminder</h2>
                <p>You haven't yet submitted your response to: <strong>${surveyTitle}</strong></p>
                <p><a href="${respondentUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2BB4A0; color: white; text-decoration: none; border-radius: 5px;">Complete Survey</a></p>
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.statusText}`);
      }

      console.log(`[SENDGRID] Reminder sent to ${email}`);
    } catch (error) {
      console.error("Failed to send reminder via SendGrid:", error);
      throw error;
    }
  }
}

// Use SendGrid if API key available, otherwise mock
const emailService = process.env.SENDGRID_API_KEY
  ? new SendGridEmailService()
  : new MockEmailService();

export { emailService };
