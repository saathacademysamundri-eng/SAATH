'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Notification } from '@/lib/data';

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedNotifications: Notification[] = [];
            let unread = 0;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.timestamp) { // Ensure timestamp exists
                    const notification: Notification = {
                        id: doc.id,
                        userId: data.userId,
                        message: data.message,
                        link: data.link,
                        read: data.read,
                        timestamp: data.timestamp.toDate(),
                    };
                    fetchedNotifications.push(notification);
                    if (!notification.read) {
                        unread++;
                    }
                }
            });

            // Sort notifications on the client-side to avoid needing a composite index
            fetchedNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setNotifications(fetchedNotifications);
            setUnreadCount(unread);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        const docRef = doc(db, 'notifications', notificationId);
        try {
            await updateDoc(docRef, { read: true });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    }, []);
    
    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) return;

        const batch = writeBatch(db);
        unreadNotifications.forEach(n => {
            const docRef = doc(db, 'notifications', n.id);
            batch.update(docRef, { read: true });
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }, [userId, notifications]);


    return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
