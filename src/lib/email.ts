import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
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
      from: process.env.SMTP_EMAIL || "er.narinder23@gmail.com",
      to: email,
      subject: "Welcome to Condence Solution - Account Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Condence Solution!</h2>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
              Hi <strong>${firstName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Your account has been successfully created on the Condence Solution platform.
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
              <strong>Condence Solution Team</strong>
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to Condence Solution!

Hi ${firstName},

Your account has been successfully created on the Condence Solution platform.

LOGIN CREDENTIALS:
Username: ${username}
Password: ${password}

You can now log in to your account and start managing your network.

If you did not create this account, please ignore this email or contact support.

Best regards,
Condence Solution Team
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
