// Email service for survey invitations
// This will use SendGrid/Resend when integrated

export interface EmailService {
  sendSurveyInvitation(email: string, name: string, surveyTitle: string, respondentUrl: string): Promise<void>;
  sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<void>;
}

export class MockEmailService implements EmailService {
  async sendSurveyInvitation(email: string, name: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    console.log(`[EMAIL] Invitation to ${email} for survey: ${surveyTitle}`);
    console.log(`[EMAIL] Survey Link: ${respondentUrl}`);
  }

  async sendSurveyReminder(email: string, surveyTitle: string, respondentUrl: string): Promise<void> {
    console.log(`[EMAIL] Reminder to ${email} for survey: ${surveyTitle}`);
  }
}

export const emailService = new MockEmailService();
