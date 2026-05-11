import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, token: string) => {
  if (process.env.NODE_ENV === 'test') {
    return { accepted: [email], token };
  }

  // Generate test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: '"Event Platform" <no-reply@eventplatform.com>',
    to: email,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking the link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  return info;
};
