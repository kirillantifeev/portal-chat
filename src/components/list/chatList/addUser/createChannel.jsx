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

const CreateChannel = ({ onClose }) => {

  const [user, setUser] = useState(null);

  const {currentUser} = useUserStore();

  

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("chats");

      try {
        const channelRef = doc(collection(db, "chats")); 

        const userChatRef = doc(collection(db, "userchats"), currentUser.id);

        const chat = await setDoc(channelRef, {
          chatId: channelRef.id,
          name: username,
          participants: [{ user_id: currentUser.id, role: "admin" }],
          messages: [],
          created_at: serverTimestamp()
        });

        await updateDoc(doc(collection(db, "userchats"), currentUser.id), {
          chats: arrayUnion({
            chatId: channelRef.id,
            lastMessage: "",
            updatedAt: Date.now(),
          }),
        });

        toast.success("Channel created successfully!");
        onClose();

      } catch (err) {
        toast.error(err.message)
      }
    };
  

  return (
    <div className={styles.container}>
        <div className={styles.containerBlock}>
          <h2 className={styles.title}>Create a channel</h2>
          <form className={styles.form} onSubmit={handleCreate}>
            <input className={styles.input} type="text" placeholder="Channel name" name="chats"/>
            <button className={styles.buttonSearch}>To create</button>
            <img className={styles.closeButton} src="./plus.png" alt="close" onClick={onClose}/>
          </form>
        </div>
    </div> 
  )
}

export default CreateChannel
