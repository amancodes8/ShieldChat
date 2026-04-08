import { useState, useRef } from 'react'
import './App.css'
import { Auth } from './components/Auth.jsx'
import Cookies from 'universal-cookie'
import { Chat } from './components/Chat.jsx'
import { signOut } from 'firebase/auth'
import { auth } from './firebase-config.js'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DebugEncrypted from './pages/DebugEncrypted.jsx'

function Home() {
  const cookies = new Cookies()
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [room, setRoom] = useState("")
  const [roomPassword, setRoomPassword] = useState("")
  const roomInputRef = useRef(null)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      cookies.remove("auth-token")
      setIsAuth(false)
      setRoom("")
      setRoomPassword("")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth} />
      </div>
    )
  }

  return (
    <>
      {room ? (
        <div>
          <Chat room={room} roomPassword={roomPassword} />
          <div className='sign-out'>
            <button onClick={() => { setRoom(""); setRoomPassword(""); }}>Leave Room</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      ) : (
        <div className="room">
          <label>Enter Room Name:</label>
          <input ref={roomInputRef} />
          <label style={{ marginTop: '10px', display: 'block' }}>Enter Room Password:</label>
          <input
            type="password"
            onChange={(e) => setRoomPassword(e.target.value)}
            value={roomPassword}
            placeholder="Optional (for encryption)"
          />
          <button onClick={() => setRoom(roomInputRef.current.value)}>
            Enter Chat
          </button>
          <div className='sign-out'>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/debug/encrypted" element={<DebugEncrypted />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App