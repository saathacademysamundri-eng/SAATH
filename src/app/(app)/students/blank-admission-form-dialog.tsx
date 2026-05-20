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
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Form - ${settings.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 0.4in; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff; color: #000; font-size: 10pt; line-height: 1.4; }
            .container { max-width: 800px; margin: auto; padding: 20px; border: 2px solid #333; position: relative; }
            
            /* Header */
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24pt; font-weight: 800; font-style: italic; color: #000; }
            .contact-info { font-size: 8pt; margin-top: 5px; color: #444; }
            
            /* Top Fields */
            .top-row { display: flex; justify-content: space-between; margin-bottom: 25px; margin-top: 15px; }
            .top-field { display: flex; align-items: flex-end; gap: 5px; font-weight: bold; }
            .underline { border-bottom: 1px solid #000; width: 120px; height: 20px; }

            /* Grid Sections */
            .section-label-box { 
                background: #000; color: #fff; text-align: center; 
                padding: 8px; font-weight: bold; text-transform: uppercase; 
                letter-spacing: 2px; font-size: 10pt; margin-bottom: 0;
            }
            .apply-grid { display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid #000; border-top: none; }
            .grid-item { border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 10px; display: flex; align-items: center; gap: 8px; font-size: 9pt; }
            .grid-item:nth-child(5n) { border-right: none; }
            .checkbox { width: 14px; height: 14px; border: 1px solid #000; }

            /* Block Section Header */
            .section-header-pill {
                text-align: center; margin: 30px 0 20px 0;
            }
            .pill {
                display: inline-block; border: 2px solid #000; border-radius: 12px;
                padding: 5px 30px; font-weight: bold; text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Info Fields */
            .form-row { margin-bottom: 18px; display: flex; align-items: flex-end; gap: 10px; }
            .label { font-weight: bold; font-size: 9pt; min-width: 150px; }
            .long-underline { flex: 1; border-bottom: 1px solid #000; height: 20px; }
            
            /* Block Boxes */
            .block-container { display: flex; gap: 2px; }
            .box { width: 18px; height: 18px; border: 1px solid #000; }
            
            /* Compact Fields */
            .flex-row { display: flex; gap: 40px; margin-bottom: 18px; }
            .field-inline { display: flex; align-items: flex-end; gap: 8px; flex: 1; }

            .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
                <h1>${settings.name.toUpperCase()}</h1>
                <div class="contact-info">
                   Phone: ${settings.phone} | Address: ${settings.address}
                </div>
            </div>

            <div class="top-row">
                <div class="top-field">Session: <div class="underline"></div></div>
                <div class="top-field">Reg. No: <div class="underline"></div></div>
                <div class="top-field">Admission Date: <div class="underline"></div></div>
            </div>

            <div class="section-label-box">Applying For:</div>
            <div class="apply-grid">
                <div class="grid-item"><div class="checkbox"></div> 9th</div>
                <div class="grid-item"><div class="checkbox"></div> 10th</div>
                <div class="grid-item"><div class="checkbox"></div> Biology</div>
                <div class="grid-item"><div class="checkbox"></div> Computer</div>
                <div class="grid-item"><div class="checkbox"></div> Arts</div>
                <div class="grid-item"><div class="checkbox"></div> F.Sc. (Part 1)</div>
                <div class="grid-item"><div class="checkbox"></div> F.Sc. (Part 2)</div>
                <div class="grid-item"><div class="checkbox"></div> Pre Medical</div>
                <div class="grid-item"><div class="checkbox"></div> Pre Engineering</div>
                <div class="grid-item"><div class="checkbox"></div> I.C.S.</div>
            </div>

            <div class="section-header-pill">
                <div class="pill">Student's Information</div>
            </div>

            <div class="form-row">
                <div class="label">Student's Name (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="form-row">
                <div class="label">Father's Name (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 80px;">Date of Birth:</div>
                    <div class="block-container">
                        <div class="box"></div><div class="box"></div>
                        <span style="margin: 0 4px;">-</span>
                        <div class="box"></div><div class="box"></div>
                        <span style="margin: 0 4px;">-</span>
                        <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                    </div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 80px;">CNIC #:</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
            </div>

            <div class="form-row">
                <div class="label">Present Address:</div>
                <div class="long-underline"></div>
            </div>
            <div class="form-row" style="margin-top: -10px;">
                <div class="label"></div>
                <div class="long-underline"></div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 80px;">Phone (Res.):</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 120px;">Cell # Guardian / Parent:</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
            </div>

            <div class="section-header-pill">
                <div class="pill">Parent / Guardians</div>
            </div>

            <div class="form-row">
                <div class="label">Guardian's Name (BLOCK LETTERS)</div>
                <div class="block-container">
                    ${Array.from({ length: 24 }).map(() => '<div class="box"></div>').join('')}
                </div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 50px;">CNIC #:</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 120px;">Relation with Student:</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
            </div>

            <div class="form-row">
                <div class="label">Occupation: (If Business) Deals in</div>
                <div class="long-underline"></div>
            </div>

            <div class="flex-row">
                <div class="field-inline">
                    <div class="label" style="min-width: 130px;">Occupation: (If Job) Desig.</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
                <div class="field-inline">
                    <div class="label" style="min-width: 80px;">Organization:</div>
                    <div class="underline" style="flex: 1; width: auto;"></div>
                </div>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} ${settings.name} • Excellence in Education
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
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
              A high-quality A4 document will be generated with all standard academy information fields.
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
