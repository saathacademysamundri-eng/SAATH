
'use server';

import nodemailer from 'nodemailer';
import { format } from 'date-fns';

/**
 * @fileOverview Email service for the Exam Department.
 * Handles sending official exam notifications and reminders to teachers.
 */

const transporter = nodemailer.createTransport({
  host: "mail.saathsamundri.com", // Common SMTP host format for cPanel
  port: 465,
  secure: true,
  auth: {
    user: "exam@saathsamundri.com",
    pass: "saath533",
  },
});

export async function sendExamNotificationEmail(teacherEmail: string, teacherName: string, examData: any) {
  const { name, className, subjects, totalMarks, submissionDeadline } = examData;
  const deadlineStr = submissionDeadline ? format(new Date(submissionDeadline), 'PPP') : 'Not specified';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1a202c;">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">SAATH ACADEMY</h1>
        <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px; text-transform: uppercase; tracking: 0.1em;">Exam Department</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="margin-top: 0; color: #2d3748;">Hello, ${teacherName}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">A new exam task has been assigned to you. Please ensure the marks are entered into the portal before the deadline.</p>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4f46e5;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold; color: #718096; font-size: 12px; text-transform: uppercase;">Exam Name</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold; color: #718096; font-size: 12px; text-transform: uppercase;">Class</td>
              <td style="padding: 5px 0; text-align: right;">${className}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold; color: #718096; font-size: 12px; text-transform: uppercase;">Subjects</td>
              <td style="padding: 5px 0; text-align: right;">${subjects.join(', ')}</td>
            </tr>
             <tr>
              <td style="padding: 5px 0; font-weight: bold; color: #718096; font-size: 12px; text-transform: uppercase;">Total Marks</td>
              <td style="padding: 5px 0; text-align: right;">${totalMarks}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold; color: #e53e3e; font-size: 12px; text-transform: uppercase;">Deadline</td>
              <td style="padding: 5px 0; text-align: right; color: #e53e3e; font-weight: bold;">${deadlineStr}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://app.saathsamundri.com/login" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login to Portal</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #a0aec0; font-size: 12px;">
        <p style="margin: 0;">This is an automated message from SAATH Academy Samundri.</p>
        <p style="margin: 5px 0 0;">Exam Department • Office of Administration</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"SAATH Academy Exam Dept" <exam@saathsamundri.com>',
      to: teacherEmail,
      subject: `New Exam Assigned: ${name}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return { success: false, error };
  }
}

export async function sendExamReminderEmail(teacherEmail: string, teacherName: string, examName: string, deadline: Date) {
    const deadlineStr = format(new Date(deadline), 'PPP');
    const htmlContent = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #e53e3e;">URGENT: Exam Submission Reminder</h2>
            <p>Dear ${teacherName},</p>
            <p>This is a reminder that the results for <strong>${examName}</strong> are still pending.</p>
            <p><strong>Deadline:</strong> ${deadlineStr}</p>
            <p>Please enter the marks into the teacher portal as soon as possible to avoid academic delays.</p>
            <br/>
            <p>Regards,</p>
            <p><strong>SAATH Academy Exam Dept</strong></p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"SAATH Academy Exam Dept" <exam@saathsamundri.com>',
            to: teacherEmail,
            subject: `Reminder: Result Submission for ${examName}`,
            html: htmlContent,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send reminder email:", error);
        return { success: false, error };
    }
}
