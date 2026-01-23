import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function notifyCandidate(
  email: string,
  status: string,
  jobTitle: string
) {
  const messages = {
    SHORTLISTED: `🎉 Congratulations! You’ve been shortlisted for ${jobTitle}. Our HR team will contact you soon.`,
    REVIEW: `👀 Your application for ${jobTitle} is under review. We’ll update you shortly.`,
    REJECTED: `Thank you for applying for ${jobTitle}. Unfortunately, we won’t be moving forward this time.`
  };

  await transporter.sendMail({
    from: `"AI Hiring System" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Application Status - ${jobTitle}`,
    text: messages[status as keyof typeof messages]
  });
}
