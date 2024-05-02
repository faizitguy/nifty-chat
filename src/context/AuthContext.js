import { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});


    const updateUserOnlineStatus = async (userId, online) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { online });
    } catch (error) {
      console.error("Error updating user online status:", error);
    }
    };
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Update user's online status to true on login
        await updateUserOnlineStatus(user.uid, true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (currentUser) {
        // Update user's online status to false on logout
        await updateUserOnlineStatus(currentUser.uid, false);
      }
      await auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
