'use server';

import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Student } from '@/lib/data';

/**
 * @fileOverview Official Email Service for SAATH ACADEMY SAMUNDRI.
 * Handles Student Onboarding, Monthly Vouchers, and Payment Confirmations.
 */

const ACADEMY_CONFIG = {
  name: "SAATH ACADEMY SAMUNDRI",
  logo: "https://i.postimg.cc/v8L8kPMV/saath.png",
  address: "Housing Colony 2, Samundri Faisalabad",
  phone: "03438775425",
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
    user: "no-reply@saathsamundri.com",
    pass: "saath533",
  },
});

const getEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7ff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: white; }
    .header img { height: 80px; margin-bottom: 15px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 40px; color: #1f2937; line-height: 1.6; }
    .content h2 { color: #4f46e5; margin-top: 0; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6; }
    .social-links { margin-bottom: 20px; }
    .social-links a { display: inline-block; margin: 0 10px; color: #4f46e5; text-decoration: none; font-size: 20px; }
    .academy-info { font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${ACADEMY_CONFIG.logo}" alt="Logo">
      <h1>${ACADEMY_CONFIG.name}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="${ACADEMY_CONFIG.socials.facebook}">FB</a>
        <a href="${ACADEMY_CONFIG.socials.instagram}">IG</a>
        <a href="${ACADEMY_CONFIG.socials.youtube}">YT</a>
        <a href="${ACADEMY_CONFIG.socials.tiktok}">TK</a>
      </div>
      <div class="academy-info">
        <p>${ACADEMY_CONFIG.address}</p>
        <p>Phone: ${ACADEMY_CONFIG.phone} | ${ACADEMY_CONFIG.socials.email}</p>
        <p style="margin-top: 20px; opacity: 0.6;">&copy; ${new Date().getFullYear()} SAATH ACADEMY. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendStudentWelcomeEmail(student: Student) {
  if (!student.email) return;

  const html = getEmailTemplate(`
    <h2>Welcome to SAATH Academy, ${student.name}!</h2>
    <p>We are thrilled to have you join our academic community. At SAATH, we are dedicated to providing Excellence in Education through personalized learning and state-of-the-art resources.</p>
    <p><strong>Your Admission Details:</strong></p>
    <ul>
      <li><strong>Roll Number:</strong> ${student.id}</li>
      <li><strong>Class:</strong> ${student.class}</li>
      <li><strong>Father's Name:</strong> ${student.fatherName}</li>
    </ul>
    <p>You can now access the Student Portal using your Roll Number to track your academic performance and fee history.</p>
    <div style="text-align: center;">
      <a href="https://app.saathsamundri.com/portal" class="btn">Access Student Portal</a>
    </div>
  `, "Welcome to SAATH Academy");

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name}" <no-reply@saathsamundri.com>`,
      to: student.email,
      subject: `Welcome to SAATH Academy - Admission Confirmation`,
      html,
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
}

export async function sendFeePaymentConfirmationEmail(student: Student, amount: number, balance: number) {
  if (!student.email) return;

  const html = getEmailTemplate(`
    <h2>Payment Received Successfully!</h2>
    <p>Dear Parent/Student, we have successfully received your fee payment for <strong>${student.name}</strong>.</p>
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr><td><strong>Amount Received:</strong></td><td style="text-align: right;">${amount.toLocaleString()} PKR</td></tr>
        <tr><td><strong>Date:</strong></td><td style="text-align: right;">${format(new Date(), 'PPP')}</td></tr>
        <tr style="border-top: 1px solid #ddd; font-weight: bold;"><td><strong>Remaining Balance:</strong></td><td style="text-align: right; color: #4f46e5;">${balance.toLocaleString()} PKR</td></tr>
      </table>
    </div>
    <p>Thank you for your timely payment. This digital receipt is for your records.</p>
  `, "Fee Payment Confirmation");

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name}" <no-reply@saathsamundri.com>`,
      to: student.email,
      subject: `Receipt: Fee Payment Received - ${student.name}`,
      html,
    });
  } catch (error) {
    console.error("Payment confirmation email failed:", error);
  }
}

export async function sendMonthlyVoucherEmail(student: Student) {
  if (!student.email || student.totalFee <= 0) return;

  // Generate PDF
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'MMMM yyyy');
  const dueDate = format(new Date(new Date().getFullYear(), new Date().getMonth(), 10), 'PPP');

  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text(ACADEMY_CONFIG.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(ACADEMY_CONFIG.address, 105, 28, { align: 'center' });
  doc.text(`Phone: ${ACADEMY_CONFIG.phone}`, 105, 33, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`FEE VOUCHER - ${dateStr}`, 105, 55, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Student Name: ${student.name}`, 20, 70);
  doc.text(`Roll Number: ${student.id}`, 20, 80);
  doc.text(`Class: ${student.class}`, 20, 90);
  doc.text(`Due Date: ${dueDate}`, 20, 100);

  doc.setFillColor(240, 240, 240);
  doc.rect(20, 110, 170, 40, 'F');
  doc.setFontSize(14);
  doc.text(`Total Amount Due:`, 30, 133);
  doc.setFontSize(18);
  doc.text(`${student.totalFee.toLocaleString()} PKR /-`, 180, 133, { align: 'right' });

  doc.setFontSize(10);
  doc.text(`Please pay the fee by the 10th of this month to avoid late charges.`, 105, 170, { align: 'center' });
  doc.text(`Generated by SchoolUP Management System`, 105, 280, { align: 'center' });

  const pdfBase64 = doc.output('datauristring').split(',')[1];

  const html = getEmailTemplate(`
    <h2>New Monthly Fee Voucher</h2>
    <p>Dear parent/student, the fee voucher for <strong>${dateStr}</strong> has been generated for <strong>${student.name}</strong>.</p>
    <p>The total outstanding amount is <strong>${student.totalFee.toLocaleString()} PKR</strong>. A detailed PDF voucher is attached to this email.</p>
    <p>Please ensure payment is cleared by the due date to avoid any inconvenience.</p>
  `, "Monthly Fee Voucher");

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name}" <no-reply@saathsamundri.com>`,
      to: student.email,
      subject: `Fee Voucher: ${dateStr} - ${student.name}`,
      html,
      attachments: [{
        filename: `Fee_Voucher_${student.id}_${dateStr.replace(' ', '_')}.pdf`,
        content: pdfBase64,
        encoding: 'base64'
      }]
    });
  } catch (error) {
    console.error("Voucher email failed:", error);
  }
}
