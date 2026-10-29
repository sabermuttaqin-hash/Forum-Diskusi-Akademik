import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import { AcademicUser } from '../types';

interface AuthContextType {
  currentUser: AcademicUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithAdmin: (user: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsResearcher: (name: string, role: 'lecturer' | 'researcher' | 'student', institution: string, faculty: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AcademicUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'SnowPrince',
  password: 'Mahasiswa890',
};

const LOCAL_STORAGE_USER_KEY = 'ruang_diskusi_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AcademicUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check persistent auth
  useEffect(() => {
    testConnection();

    // Check localStorage first for non-google admin/academic sessions
    const savedLocalUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        if (parsed && parsed.uid) {
          setCurrentUser(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // Subscribe to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let userProfile: AcademicUser;
          
          try {
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              userProfile = snap.data() as AcademicUser;
            } else {
              const isAdminEmail = fbUser.email === 'sabermuttaqin@gmail.com';
              userProfile = {
                uid: fbUser.uid,
                displayName: fbUser.displayName || 'Akademisi Terdaftar',
                email: fbUser.email || '',
                role: isAdminEmail ? 'admin' : 'researcher',
                institution: 'Universitas Indonesia',
                faculty: 'Fakultas Sains & Teknologi',
                bio: 'Peneliti aktif dan partisipan ruang diskusi ilmiah.',
                reputation: 150,
                photoURL: fbUser.photoURL || undefined,
                isAdmin: isAdminEmail,
                createdAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, userProfile);
            }
          } catch (err) {
            console.warn('Firestore fetch user error, using fallback:', err);
            userProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'Akademisi Terdaftar',
              email: fbUser.email || '',
              role: fbUser.email === 'sabermuttaqin@gmail.com' ? 'admin' : 'researcher',
              institution: 'Lembaga Riset Akademik',
              faculty: 'Studi Pascasarjana',
              bio: 'Peneliti di Ruang Diskusi Akademik.',
              reputation: 100,
              photoURL: fbUser.photoURL || undefined,
              isAdmin: fbUser.email === 'sabermuttaqin@gmail.com',
              createdAt: new Date().toISOString(),
            };
          }

          setCurrentUser(userProfile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      } else {
        // If no firebase user and no local session
        if (!localStorage.getItem(LOCAL_STORAGE_USER_KEY)) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google sign in via Firebase popup
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const isAdminEmail = fbUser.email === 'sabermuttaqin@gmail.com';

      const userProfile: AcademicUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Akademisi Google',
        email: fbUser.email || '',
        role: isAdminEmail ? 'admin' : 'researcher',
        institution: 'Universitas Riset',
        faculty: 'Fakultas Multidisiplin',
        bio: 'Peneliti dan akademisi berdedikasi tinggi.',
        reputation: 200,
        photoURL: fbUser.photoURL || undefined,
        isAdmin: isAdminEmail,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), userProfile, { merge: true });
      } catch (err) {
        console.warn('Failed saving user to Firestore:', err);
      }

      setCurrentUser(userProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Admin Login with username SnowPrince and Password Mahasiswa890
  const loginWithAdmin = async (user: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    if (user.trim() === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      const adminUser: AcademicUser = {
        uid: 'admin_snowprince',
        displayName: 'SnowPrince',
        email: 'snowprince@akademik.edu',
        role: 'admin',
        institution: 'Dewan Pengawas Riset & Etika Akademik',
        faculty: 'Direktorat Pengkajian Ilmiah & Publikasi',
        bio: 'Administrator Utama Ruang Diskusi Akademik. Bertanggung jawab atas integritas riset, moderasi ilmiah, dan kurasi perdebatan akademis.',
        reputation: 9999,
        isAdmin: true,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', adminUser.uid), adminUser, { merge: true });
      } catch (e) {
        console.warn('Sync admin to firestore warning:', e);
      }

      setCurrentUser(adminUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }
    return {
      success: false,
      message: 'Kombinasi Username atau Password Admin salah. Gunakan username SnowPrince dan Password Mahasiswa890.',
    };
  };

  // Fast registration / login for student or researcher
  const loginAsResearcher = async (
    name: string,
    role: 'lecturer' | 'researcher' | 'student',
    institution: string,
    faculty: string
  ) => {
    const customUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roleTitles = {
      lecturer: 'Dosen / Peneliti Senior',
      researcher: 'Peneliti Pascasarjana',
      student: 'Mahasiswa Peneliti',
    };

    const newUser: AcademicUser = {
      uid: customUid,
      displayName: name.trim() || 'Akademisi Tamu',
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mahasiswa'}@kampus.ac.id`,
      role,
      institution: institution.trim() || 'Universitas Indonesia',
      faculty: faculty.trim() || 'Fakultas Sains & Humaniora',
      bio: `${roleTitles[role]} dengan fokus kajian metode ilmiah dan penulisan karya ilmiah.`,
      reputation: role === 'lecturer' ? 500 : 120,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', customUid), newUser, { merge: true });
    } catch (e) {
      console.warn('Sync user to firestore notice:', e);
    }

    setCurrentUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
  };

  // Logout function
  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setCurrentUser(null);
  };

  // Update profile
  const updateProfile = async (data: Partial<AcademicUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
    } catch (err) {
      console.warn('Update firestore profile notice:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithGoogle,
        loginWithAdmin,
        loginAsResearcher,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
