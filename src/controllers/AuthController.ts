import type { Request, Response } from 'express';
import User from '../models/User';
import Token from '../models/Token';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';
import { Types } from 'mongoose';

export class AuthController {
  static createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { password, email } = req.body;

      // Prevent duplicates
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error('The user is already registered');
        res.status(409).json({ error: error.message });
        return;
      }

      // Create a user
      const user = new User(req.body);

      // Hash Password
      user.password = await hashPassword(password);

      // Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Send email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send('Created account, check your email to confirm it');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static confirmAccount = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Invalid Token');
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send('Account confirmed successfully');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('User not found');
        res.status(404).json({ error: error.message });
        return;
      }

      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // Send email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          'The account was not confirmed, we have sent an email to confirm it'
        );
        res.status(401).json({ error: error.message });
        return;
      }

      // Review password
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error('Incorrect Password');
        res.status(401).json({ error: error.message });
        return;
      }

      const token = generateJWT({ id: user._id as Types.ObjectId });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static requestConfirmationCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;

      // User exists
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('User is not registered');
        res.status(404).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error('User is already confirmed');
        res.status(403).json({ error: error.message });
        return;
      }

      // Generate the token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Send the email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('A new token was sent to your email');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;

      // User exists
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('User is not registered');
        res.status(404).json({ error: error.message });
        return;
      }

      // Generate token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // Sent email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      res.send('Review your email for instructions');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Invalid token');
        res.status(404).json({ error: error.message });
        return;
      }
      res.send('Valid token, Define a new password');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static updatePasswordWithToken = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Invalid token');
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send('The password was updated successfully');
    } catch (error) {
      res.status(500).json({ error: 'There was an error' });
    }
  };

  static user = async (req: Request, res: Response): Promise<void> => {
    res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists.id.toString() !== req.user.id.toString()) {
      const error = new Error('This email is already in use');
      res.status(409).json({ error: error.message });
      return;
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send('Profile updated successfully');
    } catch (error) {
      res.status(500).send('There was an error');
    }
  };

  static updateCurrentUserPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );
    if (!isPasswordCorrect) {
      const error = new Error('The current password is incorrect');
      res.status(401).json({ error: error.message });
      return;
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send('Password updated successfully');
    } catch (error) {
      res.status(500).send('There was an error');
    }
  };

  static checkPassword = async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error('The password is incorrect');
      res.status(401).json({ error: error.message });
      return;
    }

    res.send('Correct password');
  };
}
