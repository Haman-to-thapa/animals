import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { getFirestore, doc, updateDoc, arrayUnion } from '@react-native-firebase/firestore';

export const notificationService = {
    requestUserPermission: async () => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    return false;
                }
            }
        } else {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                return false;
            }
        }
        return true;
    },

    getFCMToken: async (userId: string) => {
        try {
            const token = await messaging().getToken();
            if (token) {
                // Save token to user profile
                const db = getFirestore();
                await updateDoc(doc(db, 'users', userId), {
                    fcmTokens: arrayUnion(token)
                });
            }
        } catch (error) {
            console.error('Failed to get FCM token:', error);
        }
    },

    setupListeners: () => {
        // Foreground message handler
        messaging().onMessage(async remoteMessage => {
            Alert.alert(
                remoteMessage.notification?.title || 'New Message',
                remoteMessage.notification?.body,
            );
        });

        // Background/Quit handlers are generally handled by the OS notification tray automatically
        // when the payload contains 'notification' key.
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            // Background message received
        });
    }
};
