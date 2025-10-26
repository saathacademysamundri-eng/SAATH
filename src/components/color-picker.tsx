
'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function hslStringToHsl(hslString: string) {
    if (!hslString) return { h: 0, s: 0, l: 0 };
    const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
    return { h, s, l };
}

function hslToHslString(h: number, s: number, l: number) {
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (c: number) => ('0' + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export function ColorPicker({ label, color, onChange }: { label: string, color: string, onChange: (value: string) => void }) {
    const { h, s, l } = hslStringToHsl(color);
    const hexColor = hslToHex(h,s,l);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, newH = 0, newS = 0, newL = 0;
        
        if (delta == 0) newH = 0;
        else if (cmax == r) newH = ((g - b) / delta) % 6;
        else if (cmax == g) newH = (b - r) / delta + 2;
        else newH = (r - g) / delta + 4;
        
        newH = Math.round(newH * 60);
        if (newH < 0) newH += 360;
        
        newL = (cmax + cmin) / 2;
        newS = delta == 0 ? 0 : delta / (1 - Math.abs(2 * newL - 1));
        newS = +(newS * 100).toFixed(1);
        newL = +(newL * 100).toFixed(1);

        onChange(hslToHslString(newH, newS, newL));
    }
    
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input type="color" value={hexColor} onChange={handleColorChange} className="w-12 h-10 p-1" />
                <Input value={color} onChange={(e) => onChange(e.target.value)} placeholder="e.g. 240 10% 3.9%" />
            </div>
        </div>
    )
}
