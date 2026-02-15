import { getFirestore, collection, addDoc, getDocs, query, where, limit, startAfter, orderBy, serverTimestamp, doc, updateDoc, increment, getDoc, onSnapshot, deleteDoc, runTransaction, setDoc, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { SocialPost, Comment } from '../types';

const POSTS_COLLECTION = 'social_posts';
const REPORTS_COLLECTION = 'reports';
const COMMENTS_COLLECTION = 'comments';
const LIKES_SUB_COLLECTION = 'likes';

export const socialService = {
    createPost: async (name: string, emotion: string, description: string, imageUri: string, imageBase64?: string | null) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('User must be logged in.');

        if (!imageBase64) throw new Error('Image data is required.');

        try {
            const db = getFirestore();
            await addDoc(collection(db, POSTS_COLLECTION), {
                name,
                emotion,
                description,
                imageUrl: `data:image/jpeg;base64,${imageBase64}`,
                uploadedBy: user.uid,
                authorName: user.displayName || 'Anonymous',
                authorPhoto: user.photoURL,
                likes: 0,
                commentCount: 0,
                reportCount: 0,
                createdAt: serverTimestamp(),
            });
            return true;
        } catch (error) {
            throw error;
        }
    },

    getPosts: async (lastDoc: any = null, limitCnt: number = 10) => {
        try {
            const db = getFirestore();
            const auth = getAuth();
            const userId = auth.currentUser?.uid;

            let constraints: any[] = [
                where('reportCount', '<', 5),
                orderBy('reportCount', 'asc'),
                orderBy('createdAt', 'desc')
            ];

            if (lastDoc) constraints.push(startAfter(lastDoc));
            constraints.push(limit(limitCnt));

            const q = query(collection(db, POSTS_COLLECTION), ...constraints);
            const snapshot = await getDocs(q);

            const posts: SocialPost[] = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: docSnap.id,
                ...docSnap.data(),
                isLiked: false // Default to false, check lazily or in separate call if needed
            })) as SocialPost[];

            return {
                posts,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
            };
        } catch (error) {
            throw error;
        }
    },

    deletePost: async (postId: string) => {
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, POSTS_COLLECTION, postId));
            return true;
        } catch (error) {
            throw error;
        }
    },

    batchLikeCheck: async (postIds: string[]) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId || postIds.length === 0) return {};

        const db = getFirestore();
        const results: { [key: string]: boolean } = {};

        try {
            await Promise.all(postIds.map(async (id) => {
                const likeDoc = await getDoc(doc(db, POSTS_COLLECTION, id, "likes", userId));
                results[id] = likeDoc.exists();
            }));
            return results;
        } catch (error) {
            return {};
        }
    },

    likePost: async (postId: string) => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('Login required');

        const db = getFirestore();
        const likeRef = doc(db, POSTS_COLLECTION, postId, LIKES_SUB_COLLECTION, userId);
        const postRef = doc(db, POSTS_COLLECTION, postId);

        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                transaction.set(likeRef, { likedAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    },

    reportPost: async (postId: string, reason: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');
        const db = getFirestore();

        // Fetch post details first
        const postDoc = await getDoc(doc(db, POSTS_COLLECTION, postId));
        if (!postDoc.exists) throw new Error('Post not found');
        const postData = postDoc.data() as SocialPost;

        await addDoc(collection(db, REPORTS_COLLECTION), {
            postId,
            postType: 'social',
            reportedBy: user.uid,
            reason,
            createdAt: serverTimestamp(),
            // Metadata for Admin
            ownerId: postData.uploadedBy,
            name: postData.name,
            imageUrl: postData.imageUrl
        });
        await updateDoc(doc(db, POSTS_COLLECTION, postId), { reportCount: increment(1) });
    },

    getReportedPosts: async () => {
        const db = getFirestore();
        const q = query(collection(db, POSTS_COLLECTION), where('reportCount', '>', 0), orderBy('reportCount', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: docSnap.id, ...docSnap.data() } as SocialPost));
    },

    ignoreReport: async (postId: string) => {
        await updateDoc(doc(getFirestore(), POSTS_COLLECTION, postId), { reportCount: 0 });
    },

    subscribeToComments: (postId: string, onUpdate: (comments: Comment[]) => void) => {
        const q = query(collection(getFirestore(), POSTS_COLLECTION, postId, COMMENTS_COLLECTION), orderBy('createdAt', 'asc'));
        return onSnapshot(q, (snapshot) => {
            onUpdate(snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({ id: docSnap.id, ...docSnap.data() } as Comment)));
        });
    },

    postComment: async (postId: string, text: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');
        const db = getFirestore();

        await runTransaction(db, async (transaction) => {
            const commentRef = doc(collection(db, POSTS_COLLECTION, postId, COMMENTS_COLLECTION));
            transaction.set(commentRef, {
                text, userId: user.uid, authorName: user.displayName || 'User', authorPhoto: user.photoURL, createdAt: serverTimestamp()
            });
            transaction.update(doc(db, POSTS_COLLECTION, postId), { commentCount: increment(1) });
        });
    },

    getMyPosts: async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        try {
            const db = getFirestore();
            const q = query(
                collection(db, POSTS_COLLECTION),
                where('uploadedBy', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: docSnap.id,
                ...docSnap.data(),
                isLiked: false // Initial state
            })) as SocialPost[];

            // Sort client-side
            return posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } catch (error) {
            throw error;
        }
    }
};
