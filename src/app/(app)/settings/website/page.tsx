

'use client';

import { useRouter } from 'next/navigation';

export default function WebsiteEditorPage() {
    const router = useRouter();
    if (typeof window !== 'undefined') {
        router.back();
    }
    return null;
}
