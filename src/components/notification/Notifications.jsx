import React from 'react'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import styles from "./notification.module.css"

const Notification = () => {
  return (
    <div className={styles.container}>
      <ToastContainer position="bottom-right"/> 
    </div>
  )
}

export default Notification
