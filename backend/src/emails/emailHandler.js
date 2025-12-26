import { transporter } from "../lib/nodemailer.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const info = await transporter.sendMail({
      from: `"Chatify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    console.log("✅ Welcome email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};
