import React, { useEffect, useState } from 'react'
import styles from './details.module.css'
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../store/chatStore'
import { useUserStore } from '../../store/userStore'
import { arrayRemove, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useUsershatStore } from '../../store/userchats'
import { toast } from 'react-toastify'

const Details = () => {
  const { chatId } = useChatStore();
  const { usersInfo, updateUsers } = useUsershatStore();
  const { currentUser } = useUserStore();

  const [chat, setChat] = useState(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onSnapshot(doc(db, "chats", chatId), (doc) => {
      setChat(doc.data());
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (chat?.participants) {
      updateUsers(chat.participants);
    }
  }, [chat]); 

  const handleRemoveUser = async (userId) => {
    try {
      if (!chatId || !userId) return;
  
      const participantToRemove = chat.participants.find(p => p.user_id === userId);
      if (!participantToRemove) {
        toast.error("User not found in chat");
        return;
      }

      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        participants: arrayRemove(participantToRemove) 
      });
  
      const userChatsRef = doc(db, "userchats", userId);
      const userChatsSnap = await getDoc(userChatsRef);
  
      if (userChatsSnap.exists()) {
        const updatedChats = userChatsSnap.data().chats.filter(
          chat => chat.chatId !== chatId
        );
        
        await updateDoc(userChatsRef, {
          chats: updatedChats
        });
      }
  
      toast.success("User removed successfully");
    } catch (err) {
      console.error("Error removing user:", err);
      toast.error("Failed to remove user");
    }
  };

  const filteredUsers = usersInfo.filter((c) =>
    c.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <img className={styles.avatar} src="./avatar.png" alt=""/>
        <h2>{chat?.name}</h2>
        <p>Channel</p>
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.searchBar}>
          <img className={styles.searchImg} src="./search.png" alt=""/>
          <input 
            className={styles.input} 
            type="text" 
            placeholder="Search" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div> 
        <div className={styles.usersBlock}>
          {filteredUsers
            .filter((el) => el.id !== currentUser.id)
            .map((el) => (
              <div className={styles.userContainer} key={el.id}>
                <img className={styles.userAvatar} src="./avatar.png" alt="avatar"/>
                <span className={styles.userName}>{el.username}</span>
                {chat?.participants?.find(p => 
                  p.user_id === currentUser.id && p.role === "admin"
                ) && (
                  <img 
                    className={styles.removeButton} 
                    src="./plus.png" 
                    alt="remove" 
                    onClick={() => handleRemoveUser(el.id)}
                  />
                )}
              </div>
            ))}
        </div>
        <div className={styles.info}>
          <button className={styles.blockButton} onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Details