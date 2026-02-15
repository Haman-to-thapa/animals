import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, onSnapshot, getDoc, increment, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { Chat, Message } from '../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

export const chatService = {
    // Create or get existing chat
    getOrCreateChat: async (adoptionId: string, ownerId: string, ownerName: string, ownerPhoto: string | null, petName: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');
        if (user.uid === ownerId) throw new Error('You cannot chat with yourself');

        const db = getFirestore();

        // Find existing chat between these two for this pet
        const q = query(
            collection(db, CHATS_COLLECTION),
            where('adoptionId', '==', adoptionId),
            where('participants', 'array-contains', user.uid)
        );

        const snapshot = await getDocs(q);
        const existingChat = snapshot.docs.find((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = doc.data();
            return data.participants.includes(ownerId);
        });

        if (existingChat) {
            return { id: existingChat.id, ...existingChat.data() } as Chat;
        }

        // Create new chat
        const chatData: Omit<Chat, 'id'> = {
            participants: [user.uid, ownerId],
            participantNames: {
                [user.uid]: user.displayName || 'Anonymous',
                [ownerId]: ownerName
            },
            participantPhotos: {
                [user.uid]: user.photoURL || null,
                [ownerId]: ownerPhoto
            },
            adoptionId,
            petName,
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData);
        return { id: docRef.id, ...chatData } as Chat;
    },

    // Get all chats for current user
    getChats: (callback: (chats: Chat[]) => void) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return () => { };

        const db = getFirestore();
        const q = query(
            collection(db, CHATS_COLLECTION),
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            })) as Chat[];
            callback(chats);
        }, (error) => {
            console.error('Chat list listener error:', error);
        });
    },

    // Send a message
    sendMessage: async (chatId: string, text: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        const db = getFirestore();
        const chatRef = doc(db, CHATS_COLLECTION, chatId);

        const messageData = {
            chatId,
            senderId: user.uid,
            text,
            createdAt: serverTimestamp()
        };

        // 1. Add message to subcollection
        await addDoc(collection(chatRef, MESSAGES_COLLECTION), messageData);

        // 2. Get chat to find other participants
        const chatDoc = await getDoc(chatRef);
        if (chatDoc.exists()) {
            const chatData = chatDoc.data() as Chat;
            const otherParticipants = chatData.participants.filter(id => id !== user.uid);

            const updates: any = {
                lastMessage: {
                    text,
                    senderId: user.uid,
                    createdAt: serverTimestamp()
                },
                updatedAt: serverTimestamp()
            };

            // Increment unread count for others
            otherParticipants.forEach(otherId => {
                updates[`unreadCounts.${otherId}`] = increment(1);
            });

            await updateDoc(chatRef, updates);
        }
    },

    listenToMessages: (chatId: string, callback: (messages: Message[]) => void) => {
        const db = getFirestore();
        const q = query(
            collection(doc(db, CHATS_COLLECTION, chatId), MESSAGES_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            callback(messages);
        }, (error) => {
            console.error('Message listener error:', error);
        });
    },

    getChatsForAdoption: (adoptionId: string, callback: (chats: Chat[]) => void) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return () => { };

        const db = getFirestore();
        const q = query(
            collection(db, CHATS_COLLECTION),
            where('adoptionId', '==', adoptionId),
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            if (!snapshot) return; // Guard against null snapshot
            const chats = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: doc.id,
                ...doc.data()
            })) as Chat[];
            callback(chats);
        }, (error) => {
            console.error('Adoption chat listener error:', error);
        });
    },

    markChatRead: async (chatId: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const db = getFirestore();
        const chatRef = doc(db, CHATS_COLLECTION, chatId);
        await updateDoc(chatRef, {
            [`unreadCounts.${user.uid}`]: 0
        });
    }
};
