'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, limit, orderBy } from 'firebase/firestore';
import { Notification } from '@/lib/data';

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(50)
            );

            const querySnapshot = await getDocs(q);
            const fetchedNotifications: Notification[] = [];
            let unread = 0;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.timestamp) {
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

            setNotifications(fetchedNotifications);
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId: string) => {
        const docRef = doc(db, 'notifications', notificationId);
        try {
            await updateDoc(docRef, { read: true });
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }, [userId, notifications]);


    return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}