import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";
import { useUserStore } from "./userStore";

export const useUsershatStore = create((set) => ({
    chatId: null,
    usersInfo: [],
    updateUsers: async (participants) => {  
      const users = await fetchUsernames(participants);
      return set({ usersInfo: users });
  },
}))

const fetchUsernames = async (participants) => {
  try {
      if (!participants || !Array.isArray(participants)) {
          console.error("Participants is not an array or is undefined");
          return [];
      }

      const usernames = await Promise.all(
          participants.map(async (el) => {
              const username = await searchNameUser(el.user_id);
              return { id: el.user_id, username: username, role: el.role };
          })
      );

      return usernames;
  } catch (err) {
      console.error("Error fetching usernames:", err);
      return [];
  }
};

  const searchNameUser = async (sender) => {
    try {
      const userRef = doc(db, "users", sender);

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data().username;
      } else {
        console.error("User with provided user_id not found");
      }
    } catch (err) {
      console.error("Error searching for user:", err);
    }
  };