'use server';

import nodemailer from 'nodemailer';
import { format } from 'date-fns';

/**
 * @fileOverview Email service for the Exam Department.
 * Handles sending official exam notifications to teachers.
 */

const ACADEMY_CONFIG = {
  name: "SAATH ACADEMY SAMUNDRI",
  logo: "https://i.postimg.cc/v8L8kPMV/saath.png",
  dept: "Exam Department",
  address: "Housing Colony 2, Samundri Faisalabad",
  phone: "03438775425",
  socials: {
    facebook: "https://www.facebook.com/saathsamundri",
    instagram: "https://www.instagram.com/saath_samundri",
    youtube: "https://www.youtube.com/@SAATHSamundri",
    tiktok: "https://www.tiktok.com/@saathsamundri",
    email: "info@saathsamundri.com"
  },
  icons: {
    fb: "https://img.icons8.com/fluent/48/000000/facebook-new.png",
    ig: "https://img.icons8.com/fluent/48/000000/instagram-new.png",
    yt: "https://img.icons8.com/fluent/48/000000/youtube-play.png",
    tk: "https://img.icons8.com/color/48/000000/tiktok--v1.png"
  }
};

const transporter = nodemailer.createTransport({
  host: "mail.saathsamundri.com",
  port: 465,
  secure: true,
  auth: {
    user: "exam@saathsamundri.com",
    pass: "saath533",
  },
});

function getCreativeTemplate(dept: string, teacherName: string, message: string, cardContent: string, ctaText: string, ctaUrl: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 20px; }
        .wrapper { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
        .logo { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); background: white; padding: 5px; margin-bottom: 10px; }
        .academy-name { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px; margin: 0; }
        .dept-name { color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; }
        .body { padding: 40px; }
        .greeting { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }
        .greeting span { color: #7c3aed; }
        .msg { color: #6b7280; font-size: 15px; line-height: 1.8; margin-bottom: 30px; }
        .card { background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #edf2f7; border-left: 5px solid #4f46e5; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; }
        .val { font-size: 14px; font-weight: 600; color: #1f2937; text-align: right; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #4f46e5; color: white !important; text-decoration: none; padding: 16px 45px; border-radius: 14px; font-size: 15px; font-weight: 600; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3); }
        .footer { background: #1e1b4b; padding: 40px 30px; text-align: center; color: white; }
        .f-logo { width: 55px; margin-bottom: 12px; }
        .socials { margin: 25px 0; }
        .social-link { display: inline-block; margin: 0 8px; text-decoration: none; }
        .social-icon { width: 32px; height: 32px; vertical-align: middle; }
        .footer-info { color: rgba(255,255,255,0.7); font-size: 12px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <img src="${ACADEMY_CONFIG.logo}" class="logo">
            <h1 class="academy-name">${ACADEMY_CONFIG.name}</h1>
            <p class="dept-name">${dept}</p>
        </div>
        <div class="body">
            <p class="greeting">Hello, <span>${teacherName}</span></p>
            <p class="msg">${message}</p>
            ${cardContent}
            <div class="cta">
                <a href="${ctaUrl}" class="btn">${ctaText}</a>
            </div>
        </div>
        <div class="footer">
            <img src="${ACADEMY_CONFIG.logo}" class="f-logo">
            <p style="margin: 0; font-weight: 700; font-size: 20px; letter-spacing: 1px;">${ACADEMY_CONFIG.name}</p>
            <p style="font-size: 11px; opacity: 0.6; letter-spacing: 2px; margin-top: 5px; text-transform: uppercase;">Excellence in Education</p>
            
            <div class="socials">
                <a href="${ACADEMY_CONFIG.socials.facebook}" class="social-link"><img src="${ACADEMY_CONFIG.icons.fb}" class="social-icon" alt="FB"></a>
                <a href="${ACADEMY_CONFIG.socials.instagram}" class="social-link"><img src="${ACADEMY_CONFIG.icons.ig}" class="social-icon" alt="IG"></a>
                <a href="${ACADEMY_CONFIG.socials.youtube}" class="social-link"><img src="${ACADEMY_CONFIG.icons.yt}" class="social-icon" alt="YT"></a>
                <a href="${ACADEMY_CONFIG.socials.tiktok}" class="social-link"><img src="${ACADEMY_CONFIG.icons.tk}" class="social-icon" alt="TK"></a>
            </div>

            <div class="footer-info">
                <p style="margin-bottom: 5px;">${ACADEMY_CONFIG.address}</p>
                <p>Phone: ${ACADEMY_CONFIG.phone} | Email: ${ACADEMY_CONFIG.socials.email}</p>
                <p style="font-size: 10px; opacity: 0.4; margin-top: 25px;">&copy; ${new Date().getFullYear()} ${ACADEMY_CONFIG.name}. All Rights Reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

export async function sendExamNotificationEmail(teacherEmail: string, teacherName: string, examData: any) {
  const { name, className, subjects, totalMarks, submissionDeadline } = examData;
  const deadlineStr = submissionDeadline ? format(new Date(submissionDeadline), 'PPP') : 'Not specified';

  const cardContent = `
    <div class="card">
        <h4 style="margin: 0 0 15px 0; color: #4f46e5; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Exam Task Details</h4>
        <div class="row"><span class="label">Exam Name</span><span class="val">${name}</span></div>
        <div class="row"><span class="label">Class</span><span class="val">${className}</span></div>
        <div class="row"><span class="label">Subjects</span><span class="val">${subjects.join(', ')}</span></div>
        <div class="row"><span class="label">Total Marks</span><span class="val">${totalMarks}</span></div>
        <div class="row"><span class="label">Submission Deadline</span><span class="val" style="color: #dc2626; font-weight: 800;">${deadlineStr}</span></div>
    </div>
  `;

  const html = getCreativeTemplate(
    "Exam Department",
    teacherName,
    "A new academic task has been assigned to you. Please ensure marks are submitted before the deadline to ensure timely result processing.",
    cardContent,
    "Login to Teacher Portal",
    "https://app.saathsamundri.com/login"
  );

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name} Exam Dept" <exam@saathsamundri.com>`,
      to: teacherEmail,
      subject: `Official Notification: Exam Task Assigned - ${examData.name}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return { success: false, error };
  }
}

export async function sendExamReminderEmail(teacherEmail: string, teacherName: string, examName: string, deadline: Date) {
    const cardContent = `
        <div class="card" style="border-left-color: #dc2626; background-color: #fef2f2;">
            <h4 style="margin: 0 0 15px 0; color: #b91c1c; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Pending Submission</h4>
            <div class="row"><span class="label">Exam Name</span><span class="val">${examName}</span></div>
            <div class="row"><span class="label">Deadline</span><span class="val" style="color: #dc2626; font-weight: 800;">${format(new Date(deadline), 'PPP')}</span></div>
        </div>
    `;

    const html = getCreativeTemplate(
        "Exam Department",
        teacherName,
        "This is an urgent reminder that marks for the following exam are still pending in the system. Please complete the entry as soon as possible.",
        cardContent,
        "Access Portal Now",
        "https://app.saathsamundri.com/login"
    );

    try {
        await transporter.sendMail({
            from: '"SAATH Academy Exam Dept" <exam@saathsamundri.com>',
            to: teacherEmail,
            subject: `Urgent Reminder: Result Submission for ${examName}`,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send reminder email:", error);
        return { success: false, error };
    }
}
