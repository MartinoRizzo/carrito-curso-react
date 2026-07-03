import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a persisted simulated user first
    const demoSession = localStorage.getItem('demo_user_session');
    if (demoSession) {
      try {
        setUser(JSON.parse(demoSession));
        setLoading(false);
        // We still subscribe to onAuthStateChanged in case we want to clean up,
        // but we prioritize the local session for the simulated environment.
      } catch (e) {
        localStorage.removeItem('demo_user_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // Only process Firebase Auth if we don't have an active simulated session
      if (localStorage.getItem('demo_user_session')) {
        setLoading(false);
        return;
      }

      setLoading(true);
      if (firebaseUser) {
        try {
          // Check if user role document exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          let role: 'admin' | 'user' = 'user';
          const emailLower = (firebaseUser.email || '').toLowerCase();

          // Standard rule: if email contains admin, or is the user's email, or if Firestore says admin, they are admin
          if (emailLower.includes('admin') || emailLower === 'martingabriel.rizzo@gmail.com') {
            role = 'admin';
          }

          if (userDoc.exists()) {
            const data = userDoc.data();
            // Firestore role takes precedence unless overridden by email rule (to avoid lockout)
            if (data.role === 'admin' || role === 'admin') {
              role = 'admin';
            } else {
              role = data.role || 'user';
            }
          } else {
            // Document doesn't exist, create it with appropriate role
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Usuario',
              role: role,
              createdAt: new Date().toISOString()
            });
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            role: role
          });
        } catch (error) {
          console.error('Error fetching user details from Firestore:', error);
          // Fallback to basic session if Firestore is down/perm issues
          const emailLower = (firebaseUser.email || '').toLowerCase();
          const fallbackRole = (emailLower.includes('admin') || emailLower === 'martingabriel.rizzo@gmail.com') ? 'admin' : 'user';
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            role: fallbackRole
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // Catch disabled provider or missing auth errors and run local simulation
      if (
        error.code === 'auth/operation-not-allowed' || 
        error.code === 'auth/configuration-not-found' || 
        error.message?.includes('operation-not-allowed')
      ) {
        console.warn('Firebase email/password auth is disabled. Falling back to local simulation...');
        
        const emailLower = email.toLowerCase().trim();
        
        // Check if there is a local registered user first
        const localRegisteredUsers = JSON.parse(localStorage.getItem('demo_registered_users') || '[]');
        const matchedUser = localRegisteredUsers.find((u: any) => u.email === emailLower);

        let role: 'admin' | 'user' = 'user';
        let dispName = emailLower.split('@')[0];

        if (matchedUser) {
          if (matchedUser.password !== password) {
            throw { code: 'auth/wrong-password', message: 'Contraseña incorrecta' };
          }
          role = matchedUser.role;
          dispName = matchedUser.displayName;
        } else {
          // Check standard mock accounts
          if (emailLower.includes('admin') || emailLower === 'admin@test.com' || emailLower === 'martingabriel.rizzo@gmail.com') {
            role = 'admin';
            dispName = 'Profesor Admin (Local)';
          } else if (emailLower === 'cliente@test.com') {
            dispName = 'Cliente de Prueba (Local)';
          }

          // Validate mock passwords for defaults
          if (emailLower === 'admin@test.com' && password !== 'admin123') {
            throw { code: 'auth/wrong-password', message: 'Contraseña incorrecta' };
          }
          if (emailLower === 'cliente@test.com' && password !== 'cliente123') {
            throw { code: 'auth/wrong-password', message: 'Contraseña incorrecta' };
          }
        }

        const simulatedUser: UserSession = {
          uid: 'simulated_' + Math.random().toString(36).substr(2, 9),
          email: emailLower,
          displayName: dispName,
          role: role,
          isSimulated: true
        };

        localStorage.setItem('demo_user_session', JSON.stringify(simulatedUser));
        setUser(simulatedUser);
        return;
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, role: 'admin' | 'user') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update profile in Auth
      await updateProfile(firebaseUser, { displayName });

      // Save to Firestore users collection
      const emailLower = email.toLowerCase();
      const finalRole = (emailLower.includes('admin') || emailLower === 'martingabriel.rizzo@gmail.com') ? 'admin' : role;

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        role: finalRole,
        createdAt: new Date().toISOString()
      });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        role: finalRole
      });
    } catch (error: any) {
      // Catch disabled provider or configuration errors and fall back to registration simulation
      if (
        error.code === 'auth/operation-not-allowed' || 
        error.code === 'auth/configuration-not-found' || 
        error.message?.includes('operation-not-allowed')
      ) {
        console.warn('Firebase registration is disabled. Falling back to local simulation...');
        
        const emailLower = email.toLowerCase().trim();
        const finalRole = (emailLower.includes('admin') || emailLower === 'martingabriel.rizzo@gmail.com') ? 'admin' : role;

        const simulatedUser: UserSession = {
          uid: 'simulated_' + Math.random().toString(36).substr(2, 9),
          email: emailLower,
          displayName: displayName,
          role: finalRole,
          isSimulated: true
        };

        // Save registered user locally to allow login later
        const localRegisteredUsers = JSON.parse(localStorage.getItem('demo_registered_users') || '[]');
        localRegisteredUsers.push({ email: emailLower, password, displayName, role: finalRole });
        localStorage.setItem('demo_registered_users', JSON.stringify(localRegisteredUsers));

        localStorage.setItem('demo_user_session', JSON.stringify(simulatedUser));
        setUser(simulatedUser);
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out of Firebase:', e);
    }
    localStorage.removeItem('demo_user_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
