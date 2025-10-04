
"use client"

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Teacher } from "@/lib/data"
import QRCode from "qrcode.react"
import { useEffect, useState } from "react"

export function QrCodeDialog({ teacher }: { teacher: Teacher }) {
    const [url, setUrl] = useState('');

    useEffect(() => {
        // Ensure this code only runs on the client where window is available
        if (typeof window !== 'undefined') {
            const newUrl = `${window.location.origin}/p/teacher/${teacher.id}`;
            setUrl(newUrl);
        }
    }, [teacher.id]);

    if (!url) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generating QR Code...</DialogTitle>
                </DialogHeader>
            </DialogContent>
        );
    }
  
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>QR Code for {teacher.name}</DialogTitle>
                <DialogDescription>
                    Scan this code to view the public profile.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4">
                <QRCode
                    value={url}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                />
            </div>
        </DialogContent>
  )
}
