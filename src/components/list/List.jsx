import React from 'react'
import styles from './list.module.css'
import UserInfo from './userInfo/UserInfo'
import ChatList from './chatList/ChatList'

const List = () => {
  return (
    <div className={styles.container}>
      <UserInfo/>
      <ChatList/>
    </div>
  )
}

export default List
