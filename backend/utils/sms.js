import twilio from 'twilio';

class SMS {
  constructor(user) {
    this.user = user;
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendPasswordResetCode(code) {
    const message = `Your KissMe password reset code is: ${code}. It will expire in 10 minutes.`;
    await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: this.user.phone
    });
  }

  async sendPasswordResetConfirmation() {
    const message = 'Your KissMe password has been successfully reset. If you did not request this change, please contact support immediately.';
    await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: this.user.phone
    });
  }
}

export default SMS;
