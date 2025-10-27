

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, type Settings, type Section, type TextElement, type ImageElement, type StyleProps, type IconElement } from '@/hooks/use-settings';
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

function ElementEditor({ element, onElementChange }: { element: TextElement | ImageElement | IconElement, onElementChange: (element: TextElement | ImageElement | IconElement) => void }) {
    
    const handleContentChange = (value: string) => {
       if ('text' in element) {
            onElementChange({ ...element, text: value });
        } else if ('src' in element) {
            onElementChange({ ...element, src: value });
        } else if ('icon' in element) {
            onElementChange({ ...element, icon: value });
        }
    };
    
    const handleStyleChange = (style: StyleProps) => {
        onElementChange({ ...element, style });
    };

    if (element.id.endsWith('Url') && element.type === 'text') {
        return null;
    }
    
    const isIconElement = element.type === 'icon';

    return (
        <div className="space-y-2 rounded-md border p-3">
             <Label htmlFor={element.id} className="text-sm font-medium capitalize">{element.id.replace(/([A-Z])/g, ' $1').replace(/Url/g, '').replace(/Text/g, '').trim()}</Label>
             {isIconElement ? (
                 <Input id={element.id} value={(element as IconElement).icon} onChange={(e) => handleContentChange(e.target.value)} placeholder="Enter Lucide icon name..." />
             ) : 'text' in element ? (
                 element.id.toLowerCase().includes('description') || element.id.toLowerCase().includes('subtitle') || element.id.toLowerCase().includes('quote') || element.id.toLowerCase().includes('answer') ? (
                    <Textarea id={element.id} value={element.text} onChange={(e) => handleContentChange(e.target.value)} placeholder="Enter text..." />
                 ) : (
                    <Input id={element.id} value={element.text} onChange={(e) => handleContentChange(e.target.value)} placeholder="Enter text..." />
                 )
            ) : (
                 <Input id={element.id} value={(element as ImageElement).src} onChange={(e) => handleContentChange(e.target.value)} placeholder="https://example.com/image.png" />
            )}
            {'style' in element && <StyleEditor element={element as TextElement | ImageElement} onStyleChange={handleStyleChange} />}
        </div>
    )
}

function SectionEditor({ section, onSectionChange }: { section: Section, onSectionChange: (section: Section) => void }) {
    
    const handleElementChange = (elementId: string, updatedElement: TextElement | ImageElement | IconElement) => {
        const updatedElements = section.elements.map(el => el.id === elementId ? updatedElement : el);
        onSectionChange({ ...section, elements: updatedElements });
    };

    const isDynamicSection = ['faq', 'testimonials', 'services', 'benefits'].includes(section.id);
    const hasGroupedItems = ['footerLinks1', 'footerLinks2', 'footerLinks3'].includes(section.id);

    if (hasGroupedItems) {
        const titleElement = section.elements.find(el => el.id === `${section.id}Title`) as TextElement;
        const links = section.elements.filter(el => el.id.includes('Link'));

        const groupedLinks: { text: TextElement, url: TextElement }[] = [];
        for(let i = 0; ; i++) {
            const textEl = links.find(l => l.id === `${section.id}Link${i + 1}Text`) as TextElement;
            const urlEl = links.find(l => l.id === `${section.id}Link${i + 1}Url`) as TextElement;
            if (textEl && urlEl) {
                groupedLinks.push({ text: textEl, url: urlEl });
            } else {
                break;
            }
        }
        
        const handleAddLink = () => {
            const newIndex = groupedLinks.length + 1;
            const newLinkText: TextElement = { id: `${section.id}Link${newIndex}Text`, type: 'text', text: 'New Link' };
            const newLinkUrl: TextElement = { id: `${section.id}Link${newIndex}Url`, type: 'text', text: '#' };
            const updatedElements = [...section.elements, newLinkText, newLinkUrl];
            onSectionChange({ ...section, elements: updatedElements });
        };
        
        const handleRemoveLink = (indexToRemove: number) => {
            const linkToRemove = groupedLinks[indexToRemove];
            const updatedElements = section.elements.filter(el => el.id !== linkToRemove.text.id && el.id !== linkToRemove.url.id);
            onSectionChange({ ...section, elements: updatedElements });
        }


        return (
            <AccordionItem value={section.id}>
                <AccordionTrigger>{section.name}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                    {titleElement && <ElementEditor element={titleElement} onElementChange={(updatedEl) => handleElementChange(titleElement.id, updatedEl)} />}
                     {groupedLinks.map((linkGroup, index) => (
                        <div key={index} className="space-y-2 rounded-md border p-3 relative">
                            <Label>Link {index + 1}</Label>
                            <div className="flex gap-2">
                                <Input placeholder="Link Text" value={linkGroup.text.text} onChange={(e) => handleElementChange(linkGroup.text.id, { ...linkGroup.text, text: e.target.value })} />
                                <Input placeholder="URL" value={linkGroup.url.text} onChange={(e) => handleElementChange(linkGroup.url.id, { ...linkGroup.url, text: e.target.value })} />
                                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleRemoveLink(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddLink}><PlusCircle className="mr-2 h-4 w-4" /> Add Link</Button>
                </AccordionContent>
            </AccordionItem>
        )
    }

    if (isDynamicSection) {
        const sectionPrefix = section.id.slice(0, -1); // faq -> faq, testimonials -> testimonial
        const titleElement = section.elements.find(el => el.id === `${section.id}Title`);
        const subtitleElement = section.elements.find(el => el.id === `${section.id}Subtitle`);
        const mainImageElement = section.elements.find(el => el.id === `${section.id}ImageUrl`);

        const itemKeys: {[key: string]: string[]} = {
            faq: ['Question', 'Answer'],
            testimonials: ['Quote', 'Name', 'Role', 'AvatarUrl'],
            services: ['Title', 'Description', 'Icon'],
            benefits: ['Title', 'Description', 'Icon'],
        }

        const items: any[] = [];
        for (let i = 1; ; i++) {
            const firstKey = `${sectionPrefix}${i}${itemKeys[section.id][0]}`;
            const firstElement = section.elements.find(el => el.id === firstKey);
            if (!firstElement) break;
            
            const item: any = { index: i };
            itemKeys[section.id].forEach(key => {
                const element = section.elements.find(el => el.id === `${sectionPrefix}${i}${key}`);
                item[key] = element;
            });
            items.push(item);
        }

        const handleAddItem = () => {
            const newIndex = items.length + 1;
            const newElements = itemKeys[section.id].map(key => {
                const id = `${sectionPrefix}${newIndex}${key}`;
                if (key.includes('Url')) return { id, type: 'image', src: '/placeholder.svg', alt: 'placeholder' };
                if (key.includes('Icon')) return { id, type: 'icon', icon: 'Award' };
                return { id, type: 'text', text: `New ${key}` };
            });
            onSectionChange({ ...section, elements: [...section.elements, ...newElements] });
        }
        
        const handleRemoveItem = (index: number) => {
            const idsToRemove = itemKeys[section.id].map(key => `${sectionPrefix}${index}${key}`);
            const updatedElements = section.elements.filter(el => !idsToRemove.includes(el.id));
            onSectionChange({ ...section, elements: updatedElements });
        }
        
        return (
            <AccordionItem value={section.id}>
                <AccordionTrigger>{section.name}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    {titleElement && <ElementEditor element={titleElement} onElementChange={(updatedEl) => handleElementChange(titleElement.id, updatedEl)} />}
                    {subtitleElement && <ElementEditor element={subtitleElement} onElementChange={(updatedEl) => handleElementChange(subtitleElement.id, updatedEl)} />}
                    {mainImageElement && <ElementEditor element={mainImageElement} onElementChange={(updatedEl) => handleElementChange(mainImageElement.id, updatedEl)} />}
                    
                    {items.map((item, index) => (
                        <div key={index} className="space-y-3 rounded-md border p-3 relative">
                            <div className="flex justify-between items-center">
                                <Label>Item {index + 1}</Label>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(item.index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                            {itemKeys[section.id].map(key => (
                                item[key] && <ElementEditor key={item[key].id} element={item[key]} onElementChange={(updatedEl) => handleElementChange(item[key].id, updatedEl)} />
                            ))}
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddItem}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
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
