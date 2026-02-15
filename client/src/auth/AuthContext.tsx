import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from '@react-native-firebase/firestore';
import { userService } from '../services/userService';
import { signOut as googleSignOut } from '../auth/googleAuth';

type UserProfile = {
  photoURL?: string;
  displayName?: string;
  role?: 'admin' | 'user';
};

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  profile: UserProfile | null;
  initializing: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfile) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, async (userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, [auth]);

  // Sync profile from Firestore
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;

        setProfile(data);
      } else {

        // Auto-create profile for new user
        const newProfile: any = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || null,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'users', user.uid), newProfile).catch(e =>
          console.error('[AuthContext] Error creating profile:', e)
        );
        setProfile(newProfile);
      }
    });

    return unsub;
  }, [user, db]);

  const updateProfile = async (data: UserProfile) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });

    // Also update Auth profile for displayName
    if (data.displayName) {
      await user.updateProfile({ displayName: data.displayName });
    }

    // Sync across all user content (posts, animals, comments)
    try {
      await userService.syncProfileData(user.uid, data);
    } catch (e) {
      console.error('Failed to sync profile data:', e);
    }
  };

  const logout = async () => {
    try {

      await googleSignOut();
      setUser(null);
      setProfile(null);

    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, initializing, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
