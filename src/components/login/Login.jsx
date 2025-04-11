import React, { useState } from 'react'
import styles from './login.module.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

const Login = () => {

const [avatar, setAvatar] = useState({
    file: null,
    url:"",
})

const handleAvatar = (e) => {
    if(e.target.files[0]) {
        setAvatar({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0]),
        })
    }
    
}

const [loading, setLoading] = useState(false)

const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)

    const formData = new FormData(e.target);

    const { email, password} = Object.fromEntries(formData);

    try {

        await signInWithEmailAndPassword(auth, email, password)

    }
    catch(err) {
        console.log(err);
        toast.error(err.message)
    }

    finally {
        setLoading(false)
    }
    
}

const handleRegister = async (e) => {
    e.preventDefault()

    setLoading(true)

    const formData = new FormData(e.target);

    const {username, email, password} = Object.fromEntries(formData);

    try {

    const res = await createUserWithEmailAndPassword(auth, email, password)

    await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: [],
    })

    await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
    })

    await setDoc(doc(db, "userchannels", res.user.uid), {
        chats: [],
    })

    toast.success("Account created! You can login now!")

    }

    catch(err) {
        console.log(err)
        toast.error(err.message)
    }

    finally {
        setLoading(false)
    }
}

  return (
    <div className={styles.container}>
        <div className={styles.item}>
            <h2>Welcome back,</h2>
            <form className={styles.form} onSubmit={handleLogin}>
                <input className={styles.input} type="text" placeholder='Email' name="email" />
                <input className={styles.input} type="password" placeholder='Password' name="password" />
                <button disabled={loading} className={styles.button}>{loading ? "Loading" : "Sign In"}</button>
            </form>
        </div>
        <div className={styles.separator}></div>
        <div className={styles.item}>
            <h2>Create in Account</h2>
            <form className={styles.form} onSubmit={handleRegister}>
                <label className={styles.label} htmlFor='file'>
                    <img className={styles.img} src={avatar.url || "./avatar.png"} alt=""/>
                    Upload an Image</label>
                <input className={styles.input} type="file" id="file" style={{display: 'none'}} onChange={handleAvatar}/>
                <input className={styles.input} type="text" placeholder='Username' name="username" />
                <input className={styles.input} type="text" placeholder='Email' name="email" />
                <input className={styles.input} type="password" placeholder='Password' name="password" />
                <button disabled={loading} className={styles.button}>{loading ? "Loading" : "Sign Up"}</button>
            </form>
        </div>
      
    </div>
  )
}

export default Login
