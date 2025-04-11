import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './chat.module.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../store/chatStore';
import { useUserStore } from '../../store/userStore';

const Chat = () => {

const [openEmoji, setOpenEmoji] = useState(false);
const [text, setText] = useState("");
const [chat, setChat] = useState("");

const [messages, setMessages] = useState([]);
const [usernamesById, setUsernamesById] = useState({});

const {chatId, user, name, isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
const {currentUser} = useUserStore();

const endRef = useRef(null);

useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    const onSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data())
      setMessages(res.data().message)
    })

    return () => {
      onSub();
    }
  }, [chatId])


const handleEmoji = (e) => {
    setText(prev => prev + e.emoji);
    setOpenEmoji(false)
}

const handleSend = async() => {
  if (text === '') return;

  try {
    await updateDoc(doc(db, "chats", chatId), {
      message: arrayUnion ({
        senderId: currentUser.id,
        text,
        createdAt: new Date(),
      })
    })

    const users = [currentUser.id, [user.id]];

    const userIds = users.flat.map(el => el.id)

  


    userIds.forEach(async (id) => {
      const userChatsRef = doc(db, "userchats", id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();

        const chatIndex = userChatsData.chats.findIndex(
          (c) => c.chatId === chatId
        );

        

        userChatsData.chats[chatIndex].lastMessage = text;
        userChatsData.chats[chatIndex].isSeen =
          id === currentUser.id ? true : false;
        userChatsData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatsRef, {
          chats: userChatsData.chats,
        });

        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  } catch (err) {
    console.log(err);
  } finally{
  setText("");
  }
};

useEffect(() => {
  const fetchUsernames = async () => {
    try {
      const usernames = {};
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (!(message.senderId in usernamesById)) {
          const username = await searchNameUser(message.senderId);
          usernames[message.senderId] = username;
        }
      }
      setUsernamesById((prevUsernames) => ({ ...prevUsernames, ...usernames }));
    } catch (err) {
      console.error("Error fetching usernames:", err);
    }
  };

  fetchUsernames();
}, [messages]);

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

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.user}>
            <img className={styles.avatar} src="./avatar.png" alt=""/>
            <div className={styles.userTextBlock}>
                <span className={styles.userBlock}>{name}</span>
                <p className={styles.userText}>Channel</p>
            </div>
        </div>
        <div className={styles.icons}>
            <img className={styles.icon} src="./phone.png" alt=""/>
            <img className={styles.icon} src="./video.png" alt=""/>
            <img className={styles.icon} src="./info.png" alt=""/>
        </div>
      </div>
      <div className={styles.center}>
        {
          chat?.message?.map((message) => (
            <div className={`${styles.message} ${message.senderId === currentUser?.id ? styles.messageOwn : styles.messageUser}`} key={message.createdAt}>
            <img className={styles.messageAvatar} src="./avatar.png" alt="" />
            <div className={styles.messageText}>
                <p>{message.text}</p>
                <span>{message.senderId === currentUser.id ? currentUser.username : usernamesById[message.senderId]}</span>
            </div>
        </div>
          ))
        }
        <div ref={endRef}>
        </div>
      </div>
      
      <div className={styles.bottom}>
      <div className={styles.icons}>
      { /*<img className={styles.icon} src="./img.png" alt=""/>
            <img className={styles.icon} src="./camera.png" alt=""/>
            <img className={styles.icon} src="./mic.png" alt=""/> */}
        </div>
        <input className={styles.input} type="text" 
        placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..." }
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className={styles.emoji}>
            <img className={styles.icon} src="./emoji.png" alt="" onClick={() => setOpenEmoji(prev => !prev)}/>
            <div className={styles.picker}>
              <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji}/>
            </div>
            </div>
        <button className={styles.sendButton} onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  )
}

export default Chat
