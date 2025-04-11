import React, { useEffect, useState } from 'react'
import styles from './chatList.module.css'
import AddUser from './addUser/addUser';
import { useUserStore } from '../../../store/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../store/chatStore';
import CreateChannel from './addUser/createChannel';

const ChatList = () => {
const [addMode, setAddMode] = useState(false);
const [addModeChannel, setAddModeChannel] = useState(false);

const [input, setInput] = useState('');



const [chats, setChats] = useState([]);
const [channels, setChannels] = useState([]);

    const {currentUser} = useUserStore();
    const {changeChat, chatId} = useChatStore();

  useEffect(() => { 
    const unSub = onSnapshot(
      doc(db, "userchannels", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          if (!item.chatId) {
            console.error("Invalid chatId:", item);
            return {}; 
          }
  
          const userDocRef = doc(db, "channels", item.chatId);
          const userDocSnap = await getDoc(userDocRef);
  
          if (!userDocSnap.exists()) {
            console.error("Channel document not found:", item.chatId);
            return {}; 
          }

          return { ...item, channelData: userDocSnap.data() };
        });
  
        const results = await Promise.all(promises);

        const filteredResults = results.filter(result => Object.keys(result).length > 0);

        const sortedResults = filteredResults.sort((a, b) => (b.channelData?.updatedAt || 0) - (a.channelData?.updatedAt || 0));

        setChannels(sortedResults);
      }
    );
  
    return () => {
      unSub();
    };
  }, [currentUser.id]);

  useEffect(() => { 
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          if (!item.chatId) {
            console.error("Invalid chatId:", item);
            return {};
          }
  
          const userDocRef = doc(db, "chats", item.chatId);
          const userDocSnap = await getDoc(userDocRef);
  
          if (!userDocSnap.exists()) {
            console.error("Channel document not found:", item.chatId);
            return {}; 
          }
  
          return { ...item, channelData: userDocSnap.data() };
        });
  
        const results = await Promise.all(promises);
  
        const filteredResults = results.filter(result => Object.keys(result).length > 0);
  
        const sortedResults = filteredResults.sort((a, b) => (b.channelData?.updatedAt || 0) - (a.channelData?.updatedAt || 0));
  
        setChats(sortedResults);
        console.log(sortedResults);
      }
    );
  
    return () => {
      unSub();
    };
  }, [currentUser.id]);

    const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user, chat.user.username);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectChannel = (chat) => {
    changeChat(chat.chatId, chat.channelData.participants, chat.channelData.name);
  }

  const filteredChats = chats.filter((c) =>
    String(c.channelData.name).toLowerCase().includes(input.toLowerCase())
  );

useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAddMode(false);
      }
    };

    if (addMode) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addMode]);
  

  return (
    <div className={styles.container}>
        <div className={styles.search}>
            <div className={styles.searchBar}>
                <img className={styles.searchImg} src="./search.png" alt=""/>
                <input className={styles.input} type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}/>
            </div>
            <img className={styles.plusImg} src={addMode ? "./minus.png" : "./plus.png"} alt="" onClick={() => {setAddMode((prev) => !prev)}}/>
        </div>
        {filteredChats.map((chat) => (
            <div className={styles.item} key={chat.chatId} onClick={() => 
            handleSelectChannel(chat)}>
            <img className={styles.itemAvatar} src="./avatar.png" alt="" />
            <div className={styles.texts}>
                <span className={styles.name}>{`${chat.channelData.name}`}</span>
                <p className={styles.message}>{chat.lastMessage}</p>
            </div>
        </div>  
        ))}
        
        {addMode && <AddUser onClose={() => setAddMode(false)} />}
    </div>
  )
}

export default ChatList
