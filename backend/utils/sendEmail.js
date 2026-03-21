import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to, subject, text) => {
  try {
    const smtpKey = process.env.BREVO_API_KEY?.trim(); // The user provided the SMTP key starting with xsmtpsib-
    
    if (!smtpKey) {
      console.warn('⚠️  BREVO_API_KEY (SMTP Key) is missing. Email will not be sent, but OTP is logged above.');
      return; 
    }

    // Using Port 2525 - a common bypass for Render/Vercel firewall blocks
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 2525,
      secure: false, // use STARTTLS
      auth: {
        user: 'balisaikumar9491@gmail.com', // Your Brevo login email
        pass: smtpKey, // The xsmtpsib- key you provided
      },
    });

    const info = await transporter.sendMail({
      from: 'AgriSmart <balisaikumar9491@gmail.com>',
      to: to,
      subject: subject,
      text: text,
    });

    console.log('✅ Email sent successfully via Brevo SMTP (Port 2525):', info.messageId);
  } catch (error) {
    console.error('❌ Email Utility Error:', error);
    throw new Error('Failed to send email');
  }
};