import { getFirestore, collection, addDoc, getDocs, query, where, limit, startAfter, orderBy, serverTimestamp, doc, updateDoc, increment, getDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import RNFS from 'react-native-fs';
import { Animal, AnimalSubmission } from '../types';

const ANIMALS_COLLECTION = 'animals';

export const animalService = {
    uploadSubmission: async (submission: AnimalSubmission) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('User must be logged in to upload.');

        try {
            const getPath = (uri: string) => {
                let path = decodeURIComponent(uri);
                if (path.startsWith('file://')) {
                    path = path.replace('file://', '');
                }
                return path;
            };

            const imagePath = getPath(submission.imageUri);
            const audioPath = getPath(submission.audioUri);

            let img64 = submission.imageBase64;
            let aud64 = submission.audioBase64;

            if (!img64) {
                if (!(await RNFS.exists(imagePath))) {
                    throw new Error(`Image file not found at path: ${imagePath}`);
                }
                img64 = await RNFS.readFile(imagePath, 'base64');
            }

            if (!aud64) {
                if (!(await RNFS.exists(audioPath))) {
                    throw new Error(`Audio file not found at path: ${audioPath}`);
                }
                aud64 = await RNFS.readFile(audioPath, 'base64');
            }

            const stripPrefix = (str: string) => str.replace(/^data:.*?;base64,/, '');
            const finalImg64 = stripPrefix(img64);
            const finalAud64 = stripPrefix(aud64);

            const db = getFirestore();
            await addDoc(collection(db, ANIMALS_COLLECTION), {
                name: submission.name,
                emotion: submission.emotion,
                description: submission.description,
                imageBase64: finalImg64,
                audioBase64: finalAud64,
                uploadedBy: user.uid,
                authorPhoto: user.photoURL || null,
                authorName: user.displayName || 'Anonymous',
                status: 'approved',
                createdAt: serverTimestamp(),
            });

            return true;
        } catch (error: any) {
            const message = error.message || 'Unknown error';
            throw new Error(`Submission failed: ${message}`);
        }
    },

    getAnimals: async (emotion: string | null = null, lastDoc: any = null, limitCnt: number = 10) => {
        try {
            const db = getFirestore();
            const animalsRef = collection(db, ANIMALS_COLLECTION);

            const constraints: any[] = [where('status', '==', 'approved')];

            if (emotion && emotion !== 'All') {
                constraints.push(where('emotion', '==', emotion));
            }

            if (lastDoc) {
                constraints.push(startAfter(lastDoc));
            }

            constraints.push(limit(limitCnt));

            const q = query(animalsRef, ...constraints);
            const snapshot = await getDocs(q);

            const animals: Animal[] = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            } as Animal));

            return {
                animals,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
            };
        } catch (error) {
            throw error;
        }
    },

    getMyAnimals: async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        try {
            const db = getFirestore();
            const q = query(
                collection(db, ANIMALS_COLLECTION),
                where('uploadedBy', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const animals = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            } as Animal));


            return animals.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } catch (error) {
            throw error;
        }
    },

    reportAnimal: async (animalId: string, reason: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');
        const db = getFirestore();

        const animalDoc = await getDoc(doc(db, ANIMALS_COLLECTION, animalId));
        if (!animalDoc.exists) throw new Error('Animal not found');
        const animalData = animalDoc.data() as Animal;

        await addDoc(collection(db, 'reports'), {
            postId: animalId,
            postType: 'animal',
            reportedBy: user.uid,
            reason,
            createdAt: serverTimestamp(),
            ownerId: animalData.uploadedBy,
            name: animalData.name,
            imageBase64: animalData.imageBase64
        });

        await updateDoc(doc(db, ANIMALS_COLLECTION, animalId), {
            reportCount: increment(1)
        });
    }
};
