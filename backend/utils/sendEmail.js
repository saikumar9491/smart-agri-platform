import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to, subject, text) => {
  try {
    const apiKey = process.env.BREVO_API_KEY?.trim();
    
    if (!apiKey) {
      console.warn('⚠️  BREVO_API_KEY is missing. Email will not be sent, but OTP is logged above.');
      return; 
    }


    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'AgriSmart', email: 'balisaikumar9491@gmail.com' }, // Verifed sender in Brevo
        to: [{ email: to }],
        subject: subject,
        textContent: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo Error:', data);
      throw new Error('Failed to send email via Brevo');
    }

    console.log('✅ Email sent successfully via Brevo:', data.messageId);
  } catch (error) {
    console.error('❌ Email Utility Error:', error);
    throw new Error('Failed to send email');
  }
};