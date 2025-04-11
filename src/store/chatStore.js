import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../lib/firebase";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    name: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId, user, name) => {
        const currentUser = useUserStore.getState().currentUser;

     if (name) {
        return set({
          chatId,
          user: user,
          name: name,
          isCurrentUserBlocked: false,
          isReceiverBlocked: false,
        });
      } else {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  
    },

    changeBlock: () => {
        set(state => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
    }
}))