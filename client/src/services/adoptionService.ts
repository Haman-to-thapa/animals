import { getFirestore, collection, addDoc, getDocs, query, where, limit, startAfter, orderBy, serverTimestamp, doc, updateDoc, increment, getDoc, runTransaction, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { getAuth } from '@react-native-firebase/auth';
import { Adoption, AdoptionRequest, AdoptionReport } from '../types';

const ADOPTIONS_COLLECTION = 'adoptions';
const REQUESTS_COLLECTION = 'adoption_requests';
const REPORTS_COLLECTION = 'adoption_reports';

export const adoptionService = {

    createAdoption: async (petData: Omit<Adoption, 'id' | 'ownerId' | 'ownerName' | 'status' | 'reportCount' | 'petImageUrl' | 'createdAt'>, imageBase64: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        try {
            const db = getFirestore();
            await addDoc(collection(db, ADOPTIONS_COLLECTION), {
                ...petData,
                petImageUrl: `data:image/jpeg;base64,${imageBase64}`,
                ownerId: user.uid,
                ownerName: user.displayName || 'Anonymous',
                status: 'available',
                reportCount: 0,
                createdAt: serverTimestamp(),
            });
            return true;
        } catch (error) {
            throw error;
        }
    },

    getAdoptions: async (lastDoc: any = null, limitCnt: number = 10) => {
        try {
            const db = getFirestore();
            let constraints: any[] = [
                where('status', '==', 'available')
            ];

            const q = query(collection(db, ADOPTIONS_COLLECTION), ...constraints);
            const snapshot = await getDocs(q);

            let adoptions = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as Adoption[];

            adoptions.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });


            return {
                adoptions,
                lastDoc: null,
            };
        } catch (error) {
            throw error;
        }
    },

    getMyAdoptions: async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        try {
            const db = getFirestore();
            const q = query(
                collection(db, ADOPTIONS_COLLECTION),
                where('ownerId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const adoptions = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as Adoption[];


            return adoptions
                .filter(a => a.status !== 'removed')
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        } catch (error) {
            throw error;
        }
    },


    sendAdoptionRequest: async (adoptionId: string, ownerId: string, message: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        const db = getFirestore();


        const existingQ = query(
            collection(db, REQUESTS_COLLECTION),
            where('adoptionId', '==', adoptionId),
            where('requesterId', '==', user.uid)
        );
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) throw new Error('Request already sent');

        await runTransaction(db, async (transaction) => {
            const requestRef = doc(collection(db, REQUESTS_COLLECTION));
            transaction.set(requestRef, {
                adoptionId,
                ownerId,
                requesterId: user.uid,
                requesterName: user.displayName || 'Anonymous',
                requesterPhoto: user.photoURL || undefined,
                message,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            const adoptionRef = doc(db, ADOPTIONS_COLLECTION, adoptionId);
            transaction.update(adoptionRef, { status: 'pending' });
        });
    },

    getRequestsForOwner: async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');

        const db = getFirestore();
        const q = query(
            collection(db, REQUESTS_COLLECTION),
            where('ownerId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...docSnap.data()
        })) as AdoptionRequest[];


        return requests.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    },

    respondToRequest: async (requestId: string, adoptionId: string, approve: boolean) => {
        const db = getFirestore();
        await runTransaction(db, async (transaction) => {
            const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
            const adoptionRef = doc(db, ADOPTIONS_COLLECTION, adoptionId);

            transaction.update(requestRef, { status: approve ? 'approved' : 'rejected' });
            transaction.update(adoptionRef, { status: approve ? 'adopted' : 'available' });
        });
    },

    deleteRequest: async (requestId: string) => {
        const db = getFirestore();
        await doc(db, REQUESTS_COLLECTION, requestId).delete();
    },


    reportAdoption: async (adoptionId: string, reason: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Login required');
        const db = getFirestore();


        const adoptionDoc = await getDoc(doc(db, ADOPTIONS_COLLECTION, adoptionId));
        if (!adoptionDoc.exists) throw new Error('Adoption not found');
        const adoptionData = adoptionDoc.data() as Adoption;

        await addDoc(collection(db, 'reports'), {
            postId: adoptionId,
            postType: 'adopt',
            reportedBy: user.uid,
            reason,
            createdAt: serverTimestamp(),

            ownerId: adoptionData.ownerId,
            petName: adoptionData.petName,
            petImageUrl: adoptionData.petImageUrl
        });
        await updateDoc(doc(db, ADOPTIONS_COLLECTION, adoptionId), {
            reportCount: increment(1)
        });
    },

    getReportedAdoptions: async () => {
        const db = getFirestore();
        const q = query(
            collection(db, ADOPTIONS_COLLECTION),
            where('reportCount', '>', 0),
            orderBy('reportCount', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: docSnap.id,
            ...docSnap.data()
        })) as Adoption[];
    },

    ignoreAdoptionReport: async (adoptionId: string) => {
        const db = getFirestore();
        await updateDoc(doc(db, ADOPTIONS_COLLECTION, adoptionId), {
            reportCount: 0
        });
    },

    approveAdoption: async (adoptionId: string) => {
        const db = getFirestore();
        await updateDoc(doc(db, ADOPTIONS_COLLECTION, adoptionId), {
            status: 'available',
            reportCount: 0
        });
    },

    deleteAdoption: async (adoptionId: string) => {
        const db = getFirestore();
        await updateDoc(doc(db, ADOPTIONS_COLLECTION, adoptionId), {
            status: 'removed'
        });
    }
};
