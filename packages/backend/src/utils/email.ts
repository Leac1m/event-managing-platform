import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import env from './env.js';

const FRONTEND_URL = env.FRONTEND_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  if (process.env.NODE_ENV === 'test') {
    return { accepted: [email], token };
  }

  const transporter = nodemailer.createTransport(
    MailtrapTransport({
      token: env.MAILTRAP_TOKEN,
    }),
  );

  const verificationUrl = new URL('/verify-email', FRONTEND_URL);
  verificationUrl.searchParams.set('token', token);

  const sender = {
    address: 'hello@demomailtrap.co',
    name: 'Mailtrap Test',
  };

  const recipients = ['michaelobe3@gmail.com'];

  const info = await transporter.sendMail({
    from: sender,
    to: recipients,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the link: ${verificationUrl.toString()}`,
    html: `<p>Please verify your email by clicking the link: <a href="${verificationUrl.toString()}">${verificationUrl.toString()}</a></p>`,
  });

  // console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', verificationUrl.toString());

  return info;
};
