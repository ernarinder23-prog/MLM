import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM_EMAIL || smtpUser || "noreply@cadencesolution.com";

// Email transporter configuration
const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL || "er.narinder23@gmail.com",
        pass: process.env.SMTP_PASSWORD || "bbkr gxob hdik hdvc",
      },
    });

/**
 * Send a welcome email to a newly created user
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  username: string,
  password: string
) {
  try {
    const mailOptions = {
      from: smtpFrom,
      to: email,
      subject: "Welcome to Cadence Solution - Account Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Cadence Solution!</h2>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
              Hi <strong>${firstName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Your account has been successfully created on the Cadence Solution platform.
            </p>
            
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>Login Credentials:</strong></p>
              <p style="margin: 8px 0; color: #555;">
                <strong>Username:</strong> <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${username}</code>
              </p>
              <p style="margin: 8px 0; color: #555;">
                <strong>Password:</strong> <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${password}</code>
              </p>
            </div>
            
            <p style="color: #555; font-size: 14px; margin-top: 30px; margin-bottom: 10px;">
              You can now log in to your account and start managing your network.
            </p>
            
            <p style="color: #888; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              If you did not create this account, please ignore this email or contact support.
            </p>
            
            <p style="color: #888; font-size: 13px; margin-top: 10px;">
              Best regards,<br>
              <strong>Cadence Solution Team</strong>
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to Cadence Solution!

Hi ${firstName},

Your account has been successfully created on the Cadence Solution platform.

LOGIN CREDENTIALS:
Username: ${username}
Password: ${password}

You can now log in to your account and start managing your network.

If you did not create this account, please ignore this email or contact support.

Best regards,
Cadence Solution Team
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    const mailOptions = {
      from: smtpFrom,
      to: email,
      subject: "Reset your Cadence Solution password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset your password</h2>
          <p style="font-size: 16px; color: #555;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background:#007bff;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #888;">
            If you didn’t request this, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Reset your password\n\nOpen this link to reset your password:\n${resetUrl}\n\nIf you didn’t request this, you can ignore this email.`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}
