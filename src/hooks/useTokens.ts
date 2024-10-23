import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { enableNetwork, disableNetwork, waitForPendingWrites } from 'firebase/firestore';

const FREE_TOKENS = 10;
const IMAGE_GENERATION_COST = 0.0;

export const useTokens = () => {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enableNetwork(db).catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
      disableNetwork(db).catch(console.error);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupTokenListener = async (userId: string) => {
      try {
        const userRef = doc(db, 'users', userId);
        
        // Try to get initial data
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // New user setup with retry logic
          const retrySetup = async (attempts = 3) => {
            try {
              await setDoc(userRef, {
                tokens: FREE_TOKENS,
                createdAt: new Date(),
                lastUpdated: new Date()
              });
              return true;
            } catch (err) {
              if (attempts > 0 && !isOnline) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return retrySetup(attempts - 1);
              }
              return false;
            }
          };
          
          await retrySetup();
        }

        // Set up real-time listener with error handling
        unsubscribe = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              setTokens(doc.data().tokens);
              setError(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Token listener error:', err);
            setError('Unable to fetch token data. Please check your connection.');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up token listener:', err);
        setError('Unable to initialize token system. Please try again later.');
        setLoading(false);
      }
    };

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setupTokenListener(user.uid);
      } else {
        setTokens(0);
        setLoading(false);
        setError(null);
        if (unsubscribe) {
          unsubscribe();
        }
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isOnline]);

  const purchaseTokens = async (amount: number) => {
    if (!auth.currentUser) return false;
    if (!isOnline) {
      setError('Cannot purchase tokens while offline');
      return false;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        tokens: increment(amount),
        lastUpdated: new Date(),
        lastPurchase: {
          amount,
          date: new Date()
        }
      });
      await waitForPendingWrites(db);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      setError('Failed to purchase tokens. Please try again.');
      return false;
    }
  };

  const useTokens = async (amount: number) => {
    if (!auth.currentUser) return false;
    if (!isOnline) {
      setError('Cannot use tokens while offline');
      return false;
    }
    if (tokens < amount) {
      setError('Insufficient tokens');
      return false;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        tokens: increment(-amount),
        lastUpdated: new Date(),
        lastUsage: {
          amount,
          date: new Date()
        }
      });
      await waitForPendingWrites(db);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error using tokens:', err);
      setError('Failed to use tokens. Please try again.');
      return false;
    }
  };

  return {
    tokens,
    loading,
    error,
    isOnline,
    purchaseTokens,
    useTokens,
    IMAGE_GENERATION_COST
  };
};