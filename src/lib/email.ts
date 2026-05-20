'use server';

import nodemailer from 'nodemailer';
import { format } from 'date-fns';

/**
 * @fileOverview Email service for the Exam Department.
 * Handles sending official exam notifications and reminders to teachers.
 */

const ACADEMY_CONFIG = {
  name: "SAATH ACADEMY SAMUNDRI",
  logo: "https://i.postimg.cc/v8L8kPMV/saath.png",
  dept: "Exam Department",
  socials: {
    facebook: "https://www.facebook.com/saathsamundri",
    instagram: "https://www.instagram.com/saath_samundri",
    youtube: "https://www.youtube.com/@SAATHSamundri",
    tiktok: "https://www.tiktok.com/@saathsamundri",
    email: "info@saathsamundri.com"
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

function getExamTemplate(teacherName: string, examData: any) {
    const { name, className, subjects, totalMarks, submissionDeadline } = examData;
    const deadlineStr = submissionDeadline ? format(new Date(submissionDeadline), 'PPP') : 'Not specified';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f5f7fa; margin: 0; padding: 20px; }
        .wrapper { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #eee; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
        .logo { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); background: white; padding: 5px; margin-bottom: 10px; }
        .academy-name { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px; margin: 0; }
        .dept-name { color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; }
        .body { padding: 40px; }
        .greeting { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 10px; }
        .greeting span { color: #7c3aed; }
        .msg { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
        .card { background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #edf2f7; border-left: 5px solid #4f46e5; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; }
        .val { font-size: 14px; font-weight: 600; color: #1f2937; }
        .highlight { color: #dc2626; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #4f46e5; color: white !important; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
        .footer { background: #1e1b4b; padding: 30px; text-align: center; color: white; }
        .f-logo { width: 50px; margin-bottom: 10px; }
        .socials { margin: 20px 0; }
        .socials a { color: white; text-decoration: none; margin: 0 10px; font-weight: bold; font-size: 12px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <img src="${ACADEMY_CONFIG.logo}" class="logo">
            <h1 class="academy-name">${ACADEMY_CONFIG.name}</h1>
            <p class="dept-name">${ACADEMY_CONFIG.dept}</p>
        </div>
        <div class="body">
            <p class="greeting">Hello, <span>${teacherName}</span></p>
            <p class="msg">A new academic task has been assigned to you. Please review the details below and ensure marks are submitted before the deadline.</p>
            <div class="card">
                <div class="row"><span class="label">Exam Name</span><span class="val">${name}</span></div>
                <div class="row"><span class="label">Class</span><span class="val">${className}</span></div>
                <div class="row"><span class="label">Subjects</span><span class="val">${subjects.join(', ')}</span></div>
                <div class="row"><span class="label">Total Marks</span><span class="val">${totalMarks}</span></div>
                <div class="row"><span class="label">Deadline</span><span class="val highlight">${deadlineStr}</span></div>
            </div>
            <div class="cta">
                <a href="https://app.saathsamundri.com/login" class="btn">Login to Portal</a>
            </div>
        </div>
        <div class="footer">
            <img src="${ACADEMY_CONFIG.logo}" class="f-logo">
            <p style="margin: 0; font-weight: 700;">${ACADEMY_CONFIG.name}</p>
            <p style="font-size: 10px; opacity: 0.6; letter-spacing: 1px;">EXCELLENCE IN EDUCATION</p>
            <div class="socials">
                <a href="${ACADEMY_CONFIG.socials.facebook}">Facebook</a>
                <a href="${ACADEMY_CONFIG.socials.instagram}">Instagram</a>
                <a href="${ACADEMY_CONFIG.socials.youtube}">YouTube</a>
                <a href="${ACADEMY_CONFIG.socials.tiktok}">TikTok</a>
            </div>
            <p style="font-size: 10px; opacity: 0.5;">&copy; ${new Date().getFullYear()} ${ACADEMY_CONFIG.name}. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

export async function sendExamNotificationEmail(teacherEmail: string, teacherName: string, examData: any) {
  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name} Exam Dept" <exam@saathsamundri.com>`,
      to: teacherEmail,
      subject: `Official Notification: Exam Task Assigned - ${examData.name}`,
      html: getExamTemplate(teacherName, examData),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return { success: false, error };
  }
}

export async function sendExamReminderEmail(teacherEmail: string, teacherName: string, examName: string, deadline: Date) {
    // Reuses the template logic but with reminder context
    const html = `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h2 style="color: #dc2626;">Submission Reminder</h2>
            <p>Dear ${teacherName}, the results for <b>${examName}</b> are pending.</p>
            <p>Please log in to the portal and submit the marks before ${format(new Date(deadline), 'PPP')}.</p>
            <a href="https://app.saathsamundri.com/login" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">Go to Portal</a>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"SAATH Academy Exam Dept" <exam@saathsamundri.com>',
            to: teacherEmail,
            subject: `Urgent Reminder: Result Submission for ${examName}`,
            html: html,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send reminder email:", error);
        return { success: false, error };
    }
}
