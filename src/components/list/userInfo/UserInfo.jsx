import React, { useEffect, useState } from 'react'
import styles from './userInfo.module.css'
import { useUserStore } from '../../../store/userStore';
import CreateChannel from '../chatList/addUser/createChannel';

const UserInfo = () => {

  const {currentUser} = useUserStore();

  const [addModeChannel, setAddModeChannel] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAddModeChannel(false);
      }
    };

    if (addModeChannel) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addModeChannel]);


  return (
    <div className={styles.container}>
        <div className={styles.user}>
            <img className={styles.avatar} src="./avatar.png" alt=""/>
            <h2>{currentUser.username}</h2>
        </div>
        <div className={styles.icons}>
          { /*
            <img className={styles.icon} src="./more.png" alt=""/>
            <img className={styles.icon} src="./video.png" alt=""/> */}
            <img className={styles.icon} onClick={() => setAddModeChannel((prev) => !prev)} src="./edit.png" alt=""/>
        </div>

        {addModeChannel && (
          <CreateChannel onClose={() => setAddModeChannel(false)} />
      )}
      
    </div>
  )
}

export default UserInfo
