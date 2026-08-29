const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ email, subject, message }) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: 'ShopNest Support',
        email: process.env.MAIL_FROM,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: subject,
      htmlContent: message,
    });

    console.log(`Email successfully sent to ${email}`);
    console.log('Brevo Message ID:', result.messageId);

    return result;
  } catch (error) {
    console.error('Brevo email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;