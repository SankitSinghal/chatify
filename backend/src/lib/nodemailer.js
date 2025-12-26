import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const transporter = nodemailer.createTransport({
  host: "74.125.193.108", // Direct IPv4 for smtp.gmail.com
  port: 465,
  secure: true,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
  tls: {
    // This is the "secret sauce" - it tells the SSL certificate
    // to expect 'smtp.gmail.com' even though we connected via IP.
    servername: "smtp.gmail.com",
    rejectUnauthorized: false,
  },
  // Give it plenty of time to respond
  greetingTimeout: 10000,
  connectionTimeout: 10000,
});

console.log("Checking connection...");

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Connection failed:", error);
  } else {
    console.log("✅ Server is ready to take our messages!");
  }
});

