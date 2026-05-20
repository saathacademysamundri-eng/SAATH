'use server';

import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Student } from '@/lib/data';

/**
 * @fileOverview Official Email Service for SAATH ACADEMY SAMUNDRI.
 * Handles Student Onboarding, Monthly Vouchers, and Payment Confirmations using a Creative Template.
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

function getBaseTemplate(dept: string, greeting: string, message: string, cardContent: string, ctaText: string, ctaUrl: string) {
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
        .card { background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #edf2f7; position: relative; border-left: 5px solid #4f46e5; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; }
        .val { font-size: 14px; font-weight: 600; color: #1f2937; }
        .highlight { color: #4f46e5; }
        .cta { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #4f46e5; color: white !important; text-decoration: none; padding: 16px 45px; border-radius: 14px; font-size: 15px; font-weight: 600; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3); }
        .footer { background: #1e1b4b; padding: 35px 30px; text-align: center; color: white; }
        .f-logo { width: 55px; margin-bottom: 12px; }
        .socials { margin: 20px 0; display: flex; justify-content: center; gap: 15px; }
        .socials a { color: white; text-decoration: none; font-weight: bold; font-size: 12px; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px; }
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
            <p class="greeting">${greeting}</p>
            <p class="msg">${message}</p>
            <div class="card">
                ${cardContent}
            </div>
            <div class="cta">
                <a href="${ctaUrl}" class="btn">${ctaText}</a>
            </div>
        </div>
        <div class="footer">
            <img src="${ACADEMY_CONFIG.logo}" class="f-logo">
            <p style="margin: 0; font-weight: 700; font-size: 18px;">${ACADEMY_CONFIG.name}</p>
            <p style="font-size: 11px; opacity: 0.6; letter-spacing: 1px; margin-top: 5px;">EXCELLENCE IN EDUCATION</p>
            <div class="socials">
                <a href="${ACADEMY_CONFIG.socials.facebook}">FB</a>
                <a href="${ACADEMY_CONFIG.socials.instagram}">IG</a>
                <a href="${ACADEMY_CONFIG.socials.youtube}">YT</a>
                <a href="${ACADEMY_CONFIG.socials.tiktok}">TK</a>
            </div>
            <p style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 15px;">Address: ${ACADEMY_CONFIG.address}</p>
            <p style="font-size: 10px; opacity: 0.4; margin-top: 20px;">&copy; ${new Date().getFullYear()} ${ACADEMY_CONFIG.name}. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

export async function sendStudentWelcomeEmail(student: Student) {
  if (!student.email) return;

  const cardContent = `
    <div class="row"><span class="label">Roll Number</span><span class="val">${student.id}</span></div>
    <div class="row"><span class="label">Class</span><span class="val">${student.class}</span></div>
    <div class="row"><span class="label">Father's Name</span><span class="val">${student.fatherName}</span></div>
  `;

  const html = getBaseTemplate(
    "Admissions Department",
    `Welcome to the family, <span>${student.name}</span>!`,
    "We are thrilled to have you join our academic community. At SAATH, we are dedicated to providing Excellence in Education through personalized learning and state-of-the-art resources.",
    cardContent,
    "Access Student Portal",
    "https://app.saathsamundri.com/portal"
  );

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name}" <no-reply@saathsamundri.com>`,
      to: student.email,
      subject: `Welcome to SAATH Academy - Admission Confirmed!`,
      html,
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
}

export async function sendFeePaymentConfirmationEmail(student: Student, amount: number, balance: number) {
  if (!student.email) return;

  const cardContent = `
    <div class="row"><span class="label">Amount Paid</span><span class="val highlight">${amount.toLocaleString()} PKR</span></div>
    <div class="row"><span class="label">Date Received</span><span class="val">${format(new Date(), 'PPP')}</span></div>
    <div class="row"><span class="label">Remaining Balance</span><span class="val">${balance.toLocaleString()} PKR</span></div>
  `;

  const html = getBaseTemplate(
    "Accounts Department",
    `Payment Received Successfully!`,
    `Dear Parent/Student, we have successfully received and verified the fee payment for <b>${student.name}</b>. Your digital receipt is attached below.`,
    cardContent,
    "View Full Ledger",
    "https://app.saathsamundri.com/portal"
  );

  try {
    await transporter.sendMail({
      from: `"${ACADEMY_CONFIG.name}" <no-reply@saathsamundri.com>`,
      to: student.email,
      subject: `Official Receipt: Fee Payment Verified - ${student.name}`,
      html,
    });
  } catch (error) {
    console.error("Payment confirmation email failed:", error);
  }
}

export async function sendMonthlyVoucherEmail(student: Student) {
  if (!student.email || student.totalFee <= 0) return;

  // Generate PDF for attachment (internal logic stays the same)
  const pdfDoc = new jsPDF();
  const dateStr = format(new Date(), 'MMMM yyyy');
  pdfDoc.setFontSize(22);
  pdfDoc.text(ACADEMY_CONFIG.name, 105, 20, { align: 'center' });
  pdfDoc.setFontSize(14);
  pdfDoc.text(`Monthly Fee Voucher - ${dateStr}`, 105, 40, { align: 'center' });
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Student: ${student.name} (${student.id})`, 20, 60);
  pdfDoc.text(`Class: ${student.class}`, 20, 70);
  pdfDoc.text(`Total Amount Due: ${student.totalFee.toLocaleString()} PKR`, 20, 80);
  const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];

  const cardContent = `
    <div class="row"><span class="label">Billing Month</span><span class="val">${dateStr}</span></div>
    <div class="row"><span class="label">Total Dues</span><span class="val highlight">${student.totalFee.toLocaleString()} PKR</span></div>
    <div class="row"><span class="label">Status</span><span class="val">UNPAID</span></div>
  `;

  const html = getBaseTemplate(
    "Accounts Department",
    `Monthly Fee Voucher Generated`,
    `Dear Parent/Student, the fee voucher for <b>${dateStr}</b> is now available for <b>${student.name}</b>. A detailed PDF copy is attached to this email.`,
    cardContent,
    "Pay Online / Support",
    "https://wa.me/923438775425"
  );

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
