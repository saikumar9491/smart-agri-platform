import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"AgriSmart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Email Error:', error);
    throw new Error('Failed to send email');
  }
};