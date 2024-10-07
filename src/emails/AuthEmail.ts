import { transporter } from '../config/nodemailer';

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Confirm your account',
      text: 'UpTask - Confirm your account',
      html: `<p>Hello: ${user.name}, you have created your account in UpTask, all is almost ready, you just need to confirm your account</p>
                <p>Visit this link:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
                <p>And enter the code: <b>${user.token}</b></p>
                <p>This token expires in 10 minutes</p>
            `,
    });

    console.log('Message sent', info.messageId);
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Reset password',
      text: 'UpTask - Reset password',
      html: `<p>Hello: ${user.name}, you requested to reset your password.</p>
                <p>Visit this link:</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
                <p>And enter the code: <b>${user.token}</b></p>
                <p>This token expires in 10 minutes</p>
            `,
    });

    console.log('Message sent', info.messageId);
  };
}
