import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import { config } from './config.js';

class EmailService {
  constructor() {
    this.provider = null;

    if (config.email.resendApiKey) {
      this.provider = 'resend';
      this.resend = new Resend(config.email.resendApiKey);
    } else if (config.email.sendgridApiKey) {
      this.provider = 'sendgrid';
      sgMail.setApiKey(config.email.sendgridApiKey);
      this.sgMail = sgMail;
    } else {
      console.warn('No email service configured');
    }
  }

  async sendLeadNotification(leadData) {
    const subject = `New Lead: ${leadData.name || 'Unknown'}`;
    const htmlContent = `
      <h2>New Lead Captured</h2>
      <p><strong>Name:</strong> ${leadData.name || 'N/A'}</p>
      <p><strong>Email:</strong> ${leadData.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${leadData.phone || 'N/A'}</p>
      <p><strong>Business Type:</strong> ${leadData.business_type || 'N/A'}</p>
      <p><strong>Notes:</strong> ${leadData.notes || 'N/A'}</p>
      <p><strong>Call SID:</strong> ${leadData.call_sid || 'N/A'}</p>
    `;

    return await this.sendEmail(
      config.email.notificationEmail,
      subject,
      htmlContent
    );
  }

  async sendFollowupEmail(toEmail, leadData) {
    const name = leadData.name || 'there';
    const agentName = config.agent.name;

    const subject = `Great speaking with you - ${agentName}`;
    const htmlContent = `
      <h2>Hi ${name},</h2>
      <p>It was great speaking with you today! Thank you for taking the time to discuss your business needs.</p>
      <p>As promised, here's a summary of our conversation:</p>
      <ul>
        <li><strong>Business Type:</strong> ${leadData.business_type || 'N/A'}</li>
      </ul>
      <p>${leadData.notes || ''}</p>
      <p>If you have any questions or would like to continue our conversation, feel free to reply to this email or call us back.</p>
      <p>Best regards,<br>${agentName}</p>
    `;

    return await this.sendEmail(toEmail, subject, htmlContent);
  }

  async sendEmail(toEmail, subject, htmlContent) {
    try {
      if (this.provider === 'resend') {
        const result = await this.resend.emails.send({
          from: config.email.fromEmail,
          to: [toEmail],
          subject: subject,
          html: htmlContent,
        });

        console.log(`Email sent via Resend to ${toEmail}`);
        return true;
      } else if (this.provider === 'sendgrid') {
        const msg = {
          to: toEmail,
          from: config.email.fromEmail,
          subject: subject,
          html: htmlContent,
        };

        await this.sgMail.send(msg);
        console.log(`Email sent via SendGrid to ${toEmail}`);
        return true;
      } else {
        console.warn('No email provider configured');
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
      return false;
    }
  }
}

export const emailService = new EmailService();
