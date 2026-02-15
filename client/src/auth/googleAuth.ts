import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '813757467530-3gdlotkqff29hujloojtgfugbn3timve.apps.googleusercontent.com',
  offlineAccess: false,
});

export async function signInWithGoogle() {
  try {
    const hasPlayServices = await GoogleSignin.hasPlayServices();
    if (!hasPlayServices) {
      throw new Error('Play Services not available');
    }

    const userInfo = await GoogleSignin.signIn();

    if (userInfo.type !== 'success') {
      throw new Error('Google Sign-In was not successful or was cancelled');
    }

    const { idToken } = userInfo.data;

    if (!idToken) {
      throw new Error('Google Sign-In failed to return an ID Token');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(getAuth(), googleCredential);
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {

    await getAuth().signOut();


    try {
      await GoogleSignin.signOut();

      await GoogleSignin.revokeAccess();

    } catch (e) {
      console.warn('[googleAuth] Google-specific sign out non-critical error:', e);
    }
  } catch (error) {
    console.error('[googleAuth] Fatal sign out error:', error);
    throw error;
  }
}
