'use client';

import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/use-settings';
import { Printer, FileText } from 'lucide-react';
import { useRef } from 'react';

export function BlankAdmissionFormDialog() {
  const { settings } = useSettings();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Form - ${settings.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0.3in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff; color: #000; font-size: 10pt; line-height: 1.4; margin: 0; padding: 0; }
            .container { max-width: 100%; margin: auto; padding: 15px; border: 2px solid #000; position: relative; box-sizing: border-box; }
            
            /* Header */
            .header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
            .logo-img { height: 80px; width: 80px; object-fit: contain; }
            .header-text { text-align: left; }
            .header h1 { margin: 0; font-size: 22pt; font-weight: 800; text-transform: uppercase; color: #000; line-height: 1; }
            .contact-info { font-size: 8pt; margin-top: 5px; color: #444; font-weight: bold; }
            
            /* Top Fields */
            .top-row { display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 10px; }
            .top-field { display: flex; align-items: flex-end; gap: 5px; font-weight: bold; font-size: 9pt; }
            .underline { border-bottom: 1px solid #000; width: 140px; height: 18px; }

            /* Grid Sections */
            .section-label-box { 
                background: #000; color: #fff; text-align: center; 
                padding: 6px; font-weight: bold; text-transform: uppercase; 
                letter-spacing: 2px; font-size: 9pt; margin-bottom: 0;
            }
            .apply-grid { display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid #000; border-top: none; }
            .grid-item { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 10px; display: flex; align-items: center; gap: 8px; font-size: 8pt; }
            .grid-item:nth-child(5n) { border-right: none; }
            .checkbox { width: 12px; height: 12px; border: 1.5px solid #000; }

            /* Block Section Header */
            .section-header-pill {
                text-align: center; margin: 25px 0 15px 0;
            }
            .pill {
                display: inline-block; border: 2px solid #000; border-radius: 15px;
                padding: 4px 40px; font-weight: 900; text-transform: uppercase;
                letter-spacing: 1px; font-size: 10pt; background-color: #f9f9f9;
            }

            /* Info Fields */
            .form-row { margin-bottom: 15px; display: flex; align-items: flex-end; gap: 10px; }
            .label { font-weight: bold; font-size: 8.5pt; min-width: 160px; }
            .long-underline { flex: 1; border-bottom: 1px solid #000; height: 18px; }
            
            /* Block Boxes */
            .block-container { display: flex; gap: 1px; }
            .box { width: 16px; height: 16px; border: 1px solid #000; }
            
            /* Compact Fields */
            .flex-row { display: flex; gap: 30px; margin-bottom: 15px; }
            .field-inline { display: flex; align-items: flex-end; gap: 8px; flex: 1; }

            /* Signature Section */
            .signature-section { margin-top: 40px; display: flex; justify-content: space-between; gap: 20px; }
            .sig-box { flex: 1; text-align: center; }
            .sig-line { border-top: 1.5px solid #000; margin-bottom: 5px; width: 100%; height: 1px; }
            .sig-label { font-weight: bold; font-size: 8.5pt; text-transform: uppercase; }

            .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 25px; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
                <img src="${settings.logo}" class="logo-img" alt="Logo">
                <div class="header-text">
                  <h1>${settings.name}</h1>
                  <div class="contact-info">
                    ${settings.address} | Phone: ${settings.phone}
                  </div>
                </div>
            </div>

            <div class="top-row">
                <div class="top-field">ACADEMIC SESSION: <div class="underline"></div></div>
                <div class="top-field">ADMISSION DATE: <div class="underline"></div></div>
                <div class="top-field">REGISTRATION NO: <div class="underline"></div></div>
            </div>

            <div class="section-label-box">OFFICE USE: Applying For Class & Group</div>
            <div class="apply-grid">
                <div class="grid-item"><div class="checkbox"></div> 9th</div>
                <div class="grid-item"><div class="checkbox"></div> 10th</div>
                <div class="grid-item"><div class="checkbox"></div> Biology</div>
                <div class="grid-item"><div class="checkbox"></div> Computer</div>
                <div class="grid-item"><div class="checkbox"></div> Arts</div>
                <div class="grid-item"><div class="checkbox"></div> F.Sc (Part 1)</div>
                <div class="grid-item"><div class="checkbox"></div> F.Sc (Part 2)</div>
                <div class="grid-item"><div class="checkbox"></div> Pre-Medical</div>
                <div class="grid-item"><div class="checkbox"></div> Pre-Eng.</div>
                <div class="grid-item"><div class="checkbox"></div> I.C.S</div>
            </div>

            <div class="section-header-pill">
                <div class="pill">Student Personal Information</div>
            </div>

            <div class="form-row">
                <div class="label">STUDENT NAME (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="form-row">
                <div class="label">FATHER NAME (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 90px;">DATE OF BIRTH:</div>
                    <div class="block-container">
                        <div class="box"></div><div class="box"></div>
                        <span style="margin: 0 4px; font-weight: bold;">/</span>
                        <div class="box"></div><div class="box"></div>
                        <span style="margin: 0 4px; font-weight: bold;">/</span>
                        <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                    </div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 60px;">GENDER:</div>
                    <div style="display: flex; gap: 15px; font-size: 9pt;">
                      <div style="display: flex; align-items: center; gap: 5px;"><div class="checkbox"></div> MALE</div>
                      <div style="display: flex; align-items: center; gap: 5px;"><div class="checkbox"></div> FEMALE</div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="label">PERMANENT ADDRESS:</div>
                <div class="long-underline"></div>
            </div>
            <div class="form-row" style="margin-top: -10px;">
                <div class="label"></div>
                <div class="long-underline"></div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 80px;">STUDENT CNIC:</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 100px;">RELIGION:</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
            </div>

            <div class="section-header-pill">
                <div class="pill">Parent / Guardian Details</div>
            </div>

            <div class="form-row">
                <div class="label">GUARDIAN NAME (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 90px;">FATHER CNIC:</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 90px;">OCCUPATION:</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 110px;">WHATSAPP NO (1):</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 110px;">WHATSAPP NO (2):</div>
                    <div class="underline" style="flex: 1;"></div>
                </div>
            </div>

            <div class="form-row">
                <div class="label">LAST SCHOOL ATTENDED:</div>
                <div class="long-underline"></div>
            </div>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-label">Student Signature</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-label">Parent Signature</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-label">Principal Signature</div>
                </div>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} ${settings.name} • Excellence in Education • SchoolUP System
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 800);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Blank Admission Form
        </DialogTitle>
        <DialogDescription>
          Generate a beautiful, blank admission form for manual filling and official records.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
          <FileText className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <p className="text-sm text-center text-muted-foreground">
              A high-quality A4 document will be generated with all standard academy information fields and signature blocks.
          </p>
      </div>
      <DialogFooter className="gap-2">
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Blank Form
        </Button>
      </DialogFooter>
      <div ref={printRef} className="hidden" />
    </DialogContent>
  );
}
