import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AgriSmart <onboarding@resend.dev>', // You can update this after verifying your domain
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw new Error('Failed to send email via Resend');
    }

    console.log('✅ Email sent successfully via Resend:', data.id);
  } catch (error) {
    console.error('❌ Email Utility Error:', error);
    throw new Error('Failed to send email');
  }
};