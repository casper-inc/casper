import sendgrid from '@sendgrid/mail';
import env from '../config/env-config';
import Helpers from './helpers';

const { ADMIN_EMAIL, SENDGRID_KEY } = env;
sendgrid.setApiKey(SENDGRID_KEY);

/**
 * Contains methods for sending Emails
 *
 * @class Mailer
 */
class Mailer {
  /**
   * Sends an account verification link to a user's email
   * @param {Request} req - Request object.
   * @param {object} options - Mail options.
   * @param {string} options.email - Recipient email address.
   * @param {string} options.firstName - Recipient firstName.
   * @returns {Promise<boolean>} - Resolves as true if mail was successfully sent
   * or false if otherwise.
   * @memberof Mailer
   */
  static async sendVerificationEmail(req, {
    id, email, firstName, role
  }) {
    const verificationLink = Helpers.generateVerificationLink(req, {
      id,
      email,
      role
    });
    const mail = {
      to: email,
      from: ADMIN_EMAIL,
      templateId: 'd-598aa2e6e00b4c938278c24eeb62cc17',
      dynamic_template_data: {
        name: firstName,
        'verification-link': verificationLink
      }
    };
    try {
      await sendgrid.send(mail);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Sends a mail to the admin of a company upon successful registration.
   * @param {Request} req - Request object.
   * @param {object} options - Mail options.
   * @param {string} options.email - Recipient email address.
   * @param {string} options.firstName - Recipient firstName.
   * @param {string} options.companyToken - Recipient's Company unique Token.
   * @returns {Promise<boolean>} - Resolves as true if mail was successfully sent
   * or false if otherwise.
   * @memberof Mailer
   */
  static async sendWelcomeEmail(req, {
    id, email, firstName, role, companyToken
  }) {
    const verificationLink = Helpers.generateVerificationLink(req, {
      id,
      email,
      role
    });
    const mail = {
      to: email,
      from: ADMIN_EMAIL,
      templateId: 'd-0e0b3c582ec04e7fb6cff2bd12b9b0ba',
      dynamic_template_data: {
        name: firstName,
        'verification-link': verificationLink,
        token: companyToken
      }
    };
    try {
      await sendgrid.send(mail);
      return true;
    } catch (e) {
      return false;
    }
  }


  /**
 * Sends a password reset link to a user's email
 *
 * @param {object} options mail options
 * @param {string} options.email Recipient email address
 * @param {string} options.firstName Recipient firstName
 * @param {string} options.resetPasswordLink Password reset link
 * @returns {Promise} Sendgrid response
 * @memberof Mailer
 */
  static async sendResetMail({ email, firstName, resetPasswordLink }) {
    const mail = {
      to: email,
      from: ADMIN_EMAIL,
      templateId: 'd-a47cbbf0e90e469b92dc5329a0659b32',
      dynamic_template_data: {
        firstName,
        resetPasswordLink
      }
    };
    try {
      await sendgrid.send(mail);
      return true;
    } catch (e) {
      return e.message;
    }
  }
}
export default Mailer;
