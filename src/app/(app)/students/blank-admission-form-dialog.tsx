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
              @page { size: A4; margin: 0.2in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #fff; 
                color: #000; 
                font-size: 9.5pt; 
                line-height: 1.4; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 100%; 
                margin: auto; 
                padding: 25px; 
                border: 2px solid #000; 
                position: relative; 
                box-sizing: border-box; 
                min-height: 97vh;
                display: flex;
                flex-direction: column;
            }
            
            /* Watermark */
            .watermark {
                position: absolute;
                top: 55%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 500px;
                height: 500px;
                opacity: 0.04;
                z-index: -1;
                pointer-events: none;
            }
            .watermark img { width: 100%; height: 100%; object-fit: contain; }

            /* Header */
            .header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .logo-img { height: 80px; width: 80px; object-fit: contain; }
            .header-text { text-align: left; }
            .header h1 { margin: 0; font-size: 22pt; font-weight: 900; text-transform: uppercase; color: #000; line-height: 1; letter-spacing: -0.5px; }
            .contact-info { font-size: 9pt; margin-top: 5px; color: #000; font-weight: bold; }
            
            /* Top Fields */
            .top-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .top-field { display: flex; align-items: flex-end; gap: 5px; font-weight: bold; font-size: 9pt; }
            .underline { border-bottom: 1px solid #000; width: 140px; height: 18px; }

            /* Applying For Table */
            .section-label { font-weight: 900; text-decoration: underline; font-size: 11pt; margin-bottom: 6px; text-transform: uppercase; }
            .applying-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-bottom: 15px; }
            .applying-table td { border: 1px solid #000; padding: 5px 12px; }
            .check-box-item { display: flex; align-items: center; gap: 8px; font-weight: bold; }
            .square-box { width: 15px; height: 15px; border: 1.5px solid #000; flex-shrink: 0; }
            
            /* Personal Info Boxes */
            .section-header-pill { text-align: center; margin: 12px 0 8px 0; }
            .pill { 
                display: inline-block; border: 2px solid #000; border-radius: 20px; 
                padding: 4px 40px; font-weight: 900; text-transform: uppercase; 
                letter-spacing: 1px; font-size: 10pt; background-color: #f5f5f5; 
            }

            .form-row { margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
            .label { font-weight: 800; font-size: 9pt; min-width: 180px; text-transform: uppercase; }
            .long-underline { flex: 1; border-bottom: 1px solid #000; height: 20px; }
            
            /* Name Block Letter Boxes */
            .block-container { display: flex; gap: 0; }
            .box-group { display: flex; gap: 0; }
            .box { width: 21px; height: 21px; border: 1px solid #000; border-right: none; }
            .box:last-child { border-right: 1px solid #000; }
            
            /* Inline Row */
            .flex-row { display: flex; gap: 20px; margin-bottom: 14px; }
            .field-inline { display: flex; align-items: center; gap: 8px; flex: 1; }

            /* Signature Section */
            .signature-section { margin-top: auto; padding-top: 25px; display: flex; justify-content: space-between; gap: 40px; }
            .sig-box { flex: 1; text-align: center; }
            .sig-line { border-top: 1.5px solid #000; margin-bottom: 5px; width: 100%; }
            .sig-label { font-weight: 800; font-size: 9pt; text-transform: uppercase; }

            .footer { text-align: center; font-size: 8.5pt; color: #333; margin-top: 15px; border-top: 1px solid #ccc; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="watermark"><img src="${settings.logo}"></div>

            <div class="header">
                <img src="${settings.logo}" class="logo-img">
                <div class="header-text">
                  <h1>${settings.name}</h1>
                  <div class="contact-info">
                    ${settings.address} | Phone: ${settings.phone}
                  </div>
                </div>
            </div>

            <div class="top-row">
                <div class="top-field">ACADEMIC SESSION: <div class="underline"></div></div>
                <div class="top-field">DATE: <div class="underline"></div></div>
                <div class="top-field">REG. NO: <div class="underline"></div></div>
            </div>

            <div class="section-label">APPLYING FOR:</div>
            <table class="applying-table">
                <tr>
                    <td width="33%"><div class="check-box-item"><div class="square-box"></div> 8th</div></td>
                    <td width="33%"></td>
                    <td width="33%"></td>
                </tr>
                <tr>
                    <td><div class="check-box-item"><div class="square-box"></div> 9th</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Biology</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Computer</div></td>
                </tr>
                <tr>
                    <td><div class="check-box-item"><div class="square-box"></div> 10th</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Biology</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Computer</div></td>
                </tr>
                <tr>
                    <td rowspan="2"><div class="check-box-item"><div class="square-box"></div> F.Sc (Part 1)</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Pre-Engineering</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Pre-Medical</div></td>
                </tr>
                <tr>
                    <td><div class="check-box-item"><div class="square-box"></div> I.C.S.</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Others: .....................</div></td>
                </tr>
                <tr>
                    <td rowspan="2"><div class="check-box-item"><div class="square-box"></div> F.Sc (Part 2)</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Pre-Engineering</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Pre-Medical</div></td>
                </tr>
                <tr>
                    <td><div class="check-box-item"><div class="square-box"></div> I.C.S.</div></td>
                    <td><div class="check-box-item"><div class="square-box"></div> Others: .....................</div></td>
                </tr>
            </table>

            <div class="section-header-pill"><div class="pill">Student Information</div></div>

            <div class="form-row">
                <div class="label">Student Name (Block Letters)</div>
                <div class="block-container">${Array.from({ length: 22 }).map(() => '<div class="box"></div>').join('')}</div>
            </div>

            <div class="form-row">
                <div class="label">Father Name (Block Letters)</div>
                <div class="block-container">${Array.from({ length: 22 }).map(() => '<div class="box"></div>').join('')}</div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 100px;">Date of Birth</div>
                    <div class="block-container" style="align-items: center; gap: 4px;">
                        <div class="box-group">
                            <div class="box"></div><div class="box"></div>
                        </div>
                        <div style="font-weight: 900; font-size: 11pt;">/</div>
                        <div class="box-group">
                            <div class="box"></div><div class="box"></div>
                        </div>
                        <div style="font-weight: 900; font-size: 11pt;">/</div>
                        <div class="box-group">
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                        </div>
                    </div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 70px;">Gender</div>
                    <div style="display: flex; gap: 20px;">
                      <div class="check-box-item"><div class="square-box"></div> MALE</div>
                      <div class="check-box-item"><div class="square-box"></div> FEMALE</div>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="label">Current Institute</div>
                <div class="long-underline"></div>
            </div>

            <div class="form-row">
                <div class="label">Email Address</div>
                <div class="long-underline"></div>
            </div>

            <div class="flex-row">
                <div class="field-inline"><div class="label" style="min-width: 110px;">Student CNIC</div><div class="underline" style="flex:1;"></div></div>
                <div class="field-inline"><div class="label" style="min-width: 90px;">Religion</div><div class="underline" style="flex:1;"></div></div>
            </div>

            <div class="section-header-pill"><div class="pill">Parent / Guardian Details</div></div>

            <div class="form-row">
                <div class="label">Father CNIC</div>
                <div class="underline" style="width: 260px;"></div>
                <div class="label" style="min-width: 100px; margin-left: 20px;">Occupation</div>
                <div class="underline" style="flex:1;"></div>
            </div>

            <div class="flex-row">
                <div class="field-inline"><div class="label" style="min-width: 110px;">WhatsApp (1)</div><div class="underline" style="flex:1;"></div></div>
                <div class="field-inline"><div class="label" style="min-width: 110px;">WhatsApp (2)</div><div class="underline" style="flex:1;"></div></div>
            </div>

            <div class="form-row">
                <div class="label">Permanent Address</div>
                <div class="long-underline"></div>
            </div>

            <div class="signature-section">
                <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Student</div></div>
                <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Parent / Guardian</div></div>
                <div class="sig-box"><div class="sig-line"></div><div class="sig-label">Principal</div></div>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} ${settings.name} • Excellence in Education • Powered by SchoolUP
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Admission Form
        </DialogTitle>
        <DialogHeader>
          <DialogDescription>
            Generate a detailed blank admission form for manual record keeping.
          </DialogDescription>
        </DialogHeader>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
          <FileText className="h-16 w-16 text-primary opacity-40 mb-4" />
          <p className="text-sm text-center text-muted-foreground font-medium">
              High-quality A4 document with watermark branding and signature blocks.
          </p>
      </div>
      <DialogFooter className="gap-2">
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handlePrint} className="font-bold">
          <Printer className="mr-2 h-4 w-4" />
          Print Detailed Form
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
