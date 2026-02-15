import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, serverTimestamp, writeBatch, limit, onSnapshot, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { AdminMessage, UnifiedReport } from '../types';

const ADMIN_MESSAGES_COLLECTION = 'adminMessages';
const REPORTS_COLLECTION = 'reports';

export const moderationService = {
    // 1. Send Admin Message to User
    sendAdminMessage: async (userId: string, message: string, relatedPostId?: string) => {
        const db = getFirestore();
        await addDoc(collection(db, ADMIN_MESSAGES_COLLECTION), {
            userId,
            message,
            relatedPostId: relatedPostId || null,
            read: false,
            createdAt: serverTimestamp()
        });
    },

    // 2. Delete Content (Unified)
    deleteContent: async (collectionName: string, docId: string, userId: string, reason: string) => {
        const db = getFirestore();
        try {
            // Delete document
            await deleteDoc(doc(db, collectionName, docId));

            // Clean up reports for this post
            const q = query(collection(db, REPORTS_COLLECTION), where('postId', '==', docId));
            const reportSnaps = await getDocs(q);
            const batch = writeBatch(db);
            reportSnaps.forEach((s: any) => batch.delete(s.ref));
            await batch.commit();

            // Notify user
            await moderationService.sendAdminMessage(
                userId,
                `Your post was removed due to violation: ${reason}`,
                docId
            );
            return true;
        } catch (error) {
            console.error('Delete content error:', error);
            throw error;
        }
    },

    // 3. Update Status (Approve/Reject)
    // 3. Update Status (Approve/Reject)
    updateStatus: async (collectionName: string, docId: string, userId: string, status: 'approved' | 'rejected', reason?: string) => {
        const db = getFirestore();
        try {
            // Adoptions need status 'available' to be shown in feed
            const targetStatus = (collectionName === 'adoptions' && status === 'approved') ? 'available' : status;

            await updateDoc(doc(db, collectionName, docId), {
                status: targetStatus,
                approvedAt: status === 'approved' ? serverTimestamp() : null
            });

            if (status === 'rejected') {
                await moderationService.sendAdminMessage(
                    userId,
                    `Your submission was rejected: ${reason || 'Violation of guidelines'}`,
                    docId
                );
            } else {
                await moderationService.sendAdminMessage(
                    userId,
                    `Congratulations! Your submission for "${docId}" has been approved.`,
                    docId
                );
            }
            return true;
        } catch (error) {
            console.error('Update status error:', error);
            throw error;
        }
    },

    // 4. Report Management
    getReports: async () => {
        const db = getFirestore();
        const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'));
        const snaps = await getDocs(q);
        const { FirebaseFirestoreTypes } = require('@react-native-firebase/firestore');
        return snaps.docs.map((d: any) => ({ id: d.id, ...d.data() })) as UnifiedReport[];
    },

    ignoreReport: async (reportId: string) => {
        const db = getFirestore();
        await deleteDoc(doc(db, REPORTS_COLLECTION, reportId));
    },

    // 5. User Messages
    // 5. User Messages
    getUserMessages: (userId: string, callback: (messages: AdminMessage[]) => void) => {
        const db = getFirestore();
        const q = query(
            collection(db, ADMIN_MESSAGES_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            if (!snapshot) return;
            const messages = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            })) as AdminMessage[];
            callback(messages);
        }, (error) => {
            console.error('User messages listener error:', error);
        });
    },

    markMessageRead: async (messageId: string) => {
        const db = getFirestore();
        await updateDoc(doc(db, ADMIN_MESSAGES_COLLECTION, messageId), {
            read: true
        });
    },

    // 6. User Management
    getUsers: async () => {
        const db = getFirestore();
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data(), postType: 'user' }));
    },

    banUser: async (userId: string) => {
        const db = getFirestore();
        await updateDoc(doc(db, 'users', userId), {
            isBlocked: true,
            status: 'banned'
        });
    },

    deleteUser: async (userId: string) => {
        const db = getFirestore();
        // Delete user document (clean up posts/animals separately or via trigger if possible)
        await deleteDoc(doc(db, 'users', userId));
    }
};
