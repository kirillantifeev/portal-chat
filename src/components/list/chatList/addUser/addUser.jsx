import React, { useState } from 'react'
import styles from './addUser.module.css'
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserStore } from '../../../../store/userStore';
import { toast } from 'react-toastify';

const AddUser = ({onClose}) => {

  const [user, setUser] = useState(null);

  const {currentUser} = useUserStore();

  const [chat, setChat] = useState(null);

  
    const handleSearchChat = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const chatname = formData.get("chatname");
  
      try {
        const userRef = collection(db, "chats");
  
        const q = query(userRef, where("name", "==", chatname));
  
        const querySnapShot = await getDocs(q);
  
        if (!querySnapShot.empty) {
          setChat(querySnapShot.docs[0].data());
          console.log(chat)
        }
      } catch (err) {
        console.log(err);
      }
    };

  const handleAdd = async () => {
    try {

      const { chatId } = chat;
      const { id: currentUserId } = currentUser;
  
      const channelRef = doc(db, "chats", chatId);
  
      const channelSnap = await getDoc(channelRef);
      if (!channelSnap.exists()) {
        console.error("Channel not found");
        return;
      }

      const channelData = channelSnap.data();

      console.log(channelData)
  
      if (channelData.participants.find((participant) => participant.user_id === currentUserId)) {
        console.error("User already exists in channel");
        return;
      }
  
      await updateDoc(channelRef, {
        participants: arrayUnion({
          user_id: currentUserId,
          role: "member", 
        }),
      });
  
      const userChatsRef = doc(db, "userchats", currentUserId);
  
      const userChatsSnap = await getDoc(userChatsRef);
      if (!userChatsSnap.exists()) {
        console.error("User chats document not found");
        return;
      }
  
      const userChatsData = userChatsSnap.data();
  
      await updateDoc(userChatsRef, {
        chats: arrayUnion({
          chatId: chatId,
          lastMessage: "",
          updatedAt: Date.now(),
        }),
      });
  
      toast.success("User added to channel successfully!");
      onClose();
    } catch (err) {
      console.log(err);
      toast.error("Failed to add user to channel");
    }
  };

  return (
    <div className={styles.container}>
    <div className={styles.containerBlock}>
      <h2 className={styles.title}>Join to channel</h2>
        <form className={styles.form} onSubmit={handleSearchChat}>
            <input className={styles.input} type="text" placeholder="Username" name="chatname"/>
            <button className={styles.buttonSearch}>Search</button>
            <img className={styles.closeButton} src="./plus.png" alt="close" onClick={onClose}/>
        </form>
        {chat && (<div className={styles.user}>
            <div className={styles.details}>
                <img className={styles.img} src="./avatar.png" alt="" />
                <span>{chat.name}</span>
            </div>
            <button onClick={handleAdd} className={styles.buttonAdd}>Join</button>
            
        </div>)}
    </div>
    </div>
  )
}

export default AddUser
