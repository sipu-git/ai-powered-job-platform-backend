import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

type ApplicationStatus = | "submitted" | "Reviewing" | "Shortlisted" | "rejected" | "hired";

export async function notifyCandidate(
  email: string,
  status: ApplicationStatus = "submitted",
  jobTitle: string,
  candidateName: string,
  companyName: string
) {
  const messages: Record<ApplicationStatus, string> = {
    submitted: `Dear {{candidateName}},
Thank you for submitting your application for the position of {{title}} at {{companyName}}.
Our recruitment team has successfully received your profile and will begin reviewing it shortly.
We appreciate your interest in joining our organization and will keep you informed of any updates.

Best regards,  
HR Team  
{{companyName}}
`,

    Reviewing: `Dear {{candidateName}},
Thank you for applying for the position of {{title}}.
We would like to inform you that your application is currently under review. Our hiring team is carefully evaluating all applications to ensure a fair and thorough selection process.
We appreciate your patience and interest in joining our organization. You will be notified once a decision has been made.

Best regards,  
HR Team  
{{companyName}}
`,

    Shortlisted: `Dear {{candidateName}},
We are pleased to inform you that your application for the position of {{title}} has been shortlisted.
Our recruitment team was impressed with your profile and qualifications, and we would like to proceed with the next stage of the selection process. A member of our HR team will reach out to you shortly with further details regarding the next steps.
Thank you for your interest in joining our organization. We look forward to connecting with you soon.

Warm regards,  
HR Team  
{{companyName}}
`,

    rejected: `Dear {{candidateName}},
Thank you for taking the time to apply for the position of {{title}} and for your interest in joining {{companyName}}.
After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We received a strong pool of applicants, and this decision was not an easy one.
We truly appreciate the effort you put into your application and encourage you to apply for future opportunities that match your skills and experience.

Wishing you every success in your job search.

Kind regards,  
HR Team  
{{companyName}}
`,

    hired: `Dear {{candidateName}},
Congratulations! We are delighted to inform you that you have been selected for the position of {{title}} at {{companyName}}.
Your skills and experience stood out to our hiring team, and we are excited to welcome you to our organization.
Our HR team will contact you shortly with details regarding your offer letter, onboarding process, and next steps.

Warm regards,  
HR Team  
{{companyName}}
`
  };

  // ✅ Fully type-safe now
  let message = messages[status];

  message = message
    .replace(/{{candidateName}}/g, candidateName)
    .replace(/{{title}}/g, jobTitle)
    .replace(/{{companyName}}/g, companyName);

  await transporter.sendMail({
    from: `"HireSphere" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Application Status - ${jobTitle}`,
    text: message
  });
}
