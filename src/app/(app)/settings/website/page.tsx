

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, type Settings, type Section, type TextElement, type ImageElement, type StyleProps } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Monitor, Type, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SettingsKey = keyof Settings;

function StyleEditor({ element, onStyleChange }: { element: TextElement | ImageElement, onStyleChange: (style: StyleProps) => void }) {
    const isTextElement = 'text' in element;

    return (
        <div className="space-y-2 border-t pt-2 mt-2">
            <Label className="text-xs text-muted-foreground">Styles</Label>
            {isTextElement && (
                 <div className="space-y-1">
                    <Label htmlFor={`${element.id}-align`} className="text-xs">Alignment</Label>
                    <Select value={element.style?.textAlign} onValueChange={(value) => onStyleChange({ ...element.style, textAlign: value as any })}>
                        <SelectTrigger id={`${element.id}-align`} className="h-8 text-xs">
                            <SelectValue placeholder="Alignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            )}
        </div>
    );
}

function ElementEditor({ element, onElementChange }: { element: TextElement | ImageElement, onElementChange: (element: TextElement | ImageElement) => void }) {
    const isTextElement = 'text' in element;

    const handleContentChange = (value: string) => {
        if (isTextElement) {
            onElementChange({ ...element, text: value });
        } else {
            onElementChange({ ...element, src: value });
        }
    };
    
    const handleStyleChange = (style: StyleProps) => {
        onElementChange({ ...element, style });
    };

    if (element.id.endsWith('Url') && element.type === 'text') {
        // Hide URL fields from the generic editor as they are paired with text fields.
        return null;
    }


    return (
        <div className="space-y-2 rounded-md border p-3">
             <Label htmlFor={element.id} className="text-sm font-medium capitalize">{element.id.replace(/([A-Z])/g, ' $1').replace(/Url/g, '').replace(/Text/g, '').trim()}</Label>
            {isTextElement ? (
                 element.id.toLowerCase().includes('description') || element.id.toLowerCase().includes('subtitle') || element.id.toLowerCase().includes('quote') || element.id.toLowerCase().includes('answer') ? (
                    <Textarea id={element.id} value={element.text} onChange={(e) => handleContentChange(e.target.value)} placeholder="Enter text..." />
                 ) : (
                    <Input id={element.id} value={element.text} onChange={(e) => handleContentChange(e.target.value)} placeholder="Enter text..." />
                 )
            ) : (
                 <Input id={element.id} value={element.src} onChange={(e) => handleContentChange(e.target.value)} placeholder="https://example.com/image.png" />
            )}
            <StyleEditor element={element} onStyleChange={handleStyleChange} />
        </div>
    )
}

function SectionEditor({ section, onSectionChange }: { section: Section, onSectionChange: (section: Section) => void }) {
    
    const handleElementChange = (elementId: string, updatedElement: TextElement | ImageElement) => {
        const updatedElements = section.elements.map(el => el.id === elementId ? updatedElement : el);
        onSectionChange({ ...section, elements: updatedElements });
    };

    if (section.id.startsWith('footerLinks')) {
        const titleElement = section.elements.find(el => el.id === `${section.id}Title`) as TextElement;
        const links = section.elements.filter(el => el.id.includes('Link'));

        const groupedLinks: { text: TextElement, url: TextElement }[] = [];
        for(let i = 0; i < links.length / 2; i++) {
            const textEl = links.find(l => l.id === `${section.id}Link${i + 1}Text`) as TextElement;
            const urlEl = links.find(l => l.id === `${section.id}Link${i + 1}Url`) as TextElement;
            if (textEl && urlEl) {
                groupedLinks.push({ text: textEl, url: urlEl });
            }
        }

        return (
            <AccordionItem value={section.id}>
                <AccordionTrigger>{section.name}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                    <div className="space-y-2 rounded-md border p-3">
                        <Label>Column Title</Label>
                        <Input value={titleElement.text} onChange={(e) => handleElementChange(titleElement.id, { ...titleElement, text: e.target.value })} />
                    </div>
                     {groupedLinks.map((linkGroup, index) => (
                        <div key={index} className="space-y-2 rounded-md border p-3">
                            <Label>Link {index + 1}</Label>
                            <div className="flex gap-2">
                                <Input placeholder="Link Text" value={linkGroup.text.text} onChange={(e) => handleElementChange(linkGroup.text.id, { ...linkGroup.text, text: e.target.value })} />
                                <Input placeholder="URL" value={linkGroup.url.text} onChange={(e) => handleElementChange(linkGroup.url.id, { ...linkGroup.url, text: e.target.value })} />
                            </div>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        )
    }

    return (
        <AccordionItem value={section.id}>
            <AccordionTrigger>{section.name}</AccordionTrigger>
            <AccordionContent className="space-y-3">
                 {section.elements.map(element => (
                    <ElementEditor 
                        key={element.id} 
                        element={element}
                        onElementChange={(updatedElement) => handleElementChange(element.id, updatedElement)}
                    />
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}


export default function WebsiteEditorPage() {
    const { settings: initialSettings, updateSettings: saveSettings, isSettingsLoading } = useSettings();
    const router = useRouter();
    const { toast } = useToast();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [settings, setSettings] = useState<Partial<Settings>>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isSettingsLoading) {
            setSettings(initialSettings);
        }
    }, [initialSettings, isSettingsLoading]);
    
     useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'settingsUpdate', payload: settings }, '*');
        }
    }, [settings]);


    const handleSectionChange = (sectionId: string, updatedSection: Section) => {
        const updatedSections = settings.landingPage?.sections?.map(sec => sec.id === sectionId ? updatedSection : sec);
        setSettings(prev => ({ ...prev, landingPage: { sections: updatedSections! } }));
    };


    const handleSave = async () => {
        setIsSaving(true);
        // We only save the landingPage part of the settings from this editor
        await saveSettings({ landingPage: settings.landingPage });
        setIsSaving(false);
        toast({
            title: 'Website Content Saved',
            description: 'Your landing page has been updated.',
        });
    };

    return (
        <div className="h-screen bg-muted flex flex-col">
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">Website Editor</h1>
                        <p className="text-sm text-muted-foreground">Live-edit your landing page content.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <a href="/" target="_blank" rel="noopener noreferrer">
                            <Monitor className="h-4 w-4" />
                        </a>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-px bg-border">
                <ScrollArea className="col-span-1 h-full bg-background">
                    <Accordion type="multiple" className="w-full p-4">
                        {settings.landingPage?.sections?.map(section => (
                            <SectionEditor 
                                key={section.id} 
                                section={section}
                                onSectionChange={(updatedSection) => handleSectionChange(section.id, updatedSection)}
                            />
                        ))}
                    </Accordion>
                </ScrollArea>
                <div className="col-span-1 bg-background h-full">
                    <iframe 
                        ref={iframeRef}
                        src="/"
                        className="w-full h-full border-0"
                        title="Live Preview"
                    />
                </div>
            </div>
        </div>
    );
}


