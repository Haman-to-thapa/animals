import { getFirestore, collection, query, where, getDocs, writeBatch, doc, collectionGroup } from '@react-native-firebase/firestore';

const POSTS_COLLECTION = 'social_posts';
const ANIMALS_COLLECTION = 'animals';

export const userService = {
    syncProfileData: async (userId: string, data: { photoURL?: string; displayName?: string }) => {
        const db = getFirestore();
        const batch = writeBatch(db);
        const updates: any = {};

        if (data.photoURL) updates.authorPhoto = data.photoURL;
        if (data.displayName) updates.authorName = data.displayName;

        if (Object.keys(updates).length === 0) return;

        try {
            // 1. Update Social Posts
            const postsQuery = query(collection(db, POSTS_COLLECTION), where('uploadedBy', '==', userId));
            const postSnaps = await getDocs(postsQuery);
            postSnaps.forEach((snapshot: any) => {
                batch.update(snapshot.ref, updates);
            });

            // 2. Update Animals
            const animalsQuery = query(collection(db, ANIMALS_COLLECTION), where('uploadedBy', '==', userId));
            const animalSnaps = await getDocs(animalsQuery);
            animalSnaps.forEach((snapshot: any) => {
                batch.update(snapshot.ref, updates);
            });

            // 3. Update Comments (Collection Group)
            const commentsQuery = query(collectionGroup(db, 'comments'), where('userId', '==', userId));
            const commentSnaps = await getDocs(commentsQuery);
            commentSnaps.forEach((snapshot: any) => {
                batch.update(snapshot.ref, updates);
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error syncing profile data:', error);
            throw error;
        }
    }
};
