import { getAuth } from '@react-native-firebase/auth';

export async function getIdToken() {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

