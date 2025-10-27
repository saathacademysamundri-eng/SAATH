
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useSettings, type Settings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type SettingsKey = keyof Settings;

export default function WebsiteEditorPage() {
    const { settings: initialSettings, updateSettings, isSettingsLoading } = useSettings();
    const router = useRouter();
    const { toast } = useToast();

    const [settings, setSettings] = useState<Partial<Settings>>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isSettingsLoading) {
            setSettings(initialSettings);
        }
    }, [initialSettings, isSettingsLoading]);

    const handleSettingChange = (key: SettingsKey, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateSettings(settings);
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
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
                <ScrollArea className="col-span-1 h-full bg-background">
                    <div className="p-4 space-y-4">
                         {Object.entries(initialSettings).filter(([key]) => key.includes('hero') || key.includes('feature') || key.includes('service') || key.includes('benefit') || key.includes('option') || key.includes('testimonial') || key.includes('faq') || key.includes('cta') || key.includes('newsletter') || key.includes('social'))
                         .map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/(\d)/g, ' $1').trim()}</Label>
                                {key.toLowerCase().includes('url') || key.toLowerCase().includes('link') ? (
                                    <Input
                                        id={key}
                                        value={settings[key as SettingsKey] as string || ''}
                                        onChange={(e) => handleSettingChange(key as SettingsKey, e.target.value)}
                                        placeholder={`URL for ${key}`}
                                    />
                                ) : key.toLowerCase().includes('description') || key.toLowerCase().includes('subtitle') || key.toLowerCase().includes('quote') || key.toLowerCase().includes('answer') ? (
                                    <Textarea
                                        id={key}
                                        value={settings[key as SettingsKey] as string || ''}
                                        onChange={(e) => handleSettingChange(key as SettingsKey, e.target.value)}
                                        placeholder={`Content for ${key}`}
                                    />
                                ) : (
                                    <Input
                                        id={key}
                                        value={settings[key as SettingsKey] as string || ''}
                                        onChange={(e) => handleSettingChange(key as SettingsKey, e.target.value)}
                                        placeholder={`Value for ${key}`}
                                    />
                                )}
                            </div>
                         ))}
                    </div>
                </ScrollArea>
                <div className="col-span-1 lg:col-span-2 bg-background h-full">
                    <iframe 
                        src="/"
                        className="w-full h-full border-0"
                        title="Live Preview"
                        key={JSON.stringify(settings)} // Force re-render on setting change
                    />
                </div>
            </div>
        </div>
    );
}

