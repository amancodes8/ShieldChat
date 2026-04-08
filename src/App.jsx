import { useState, useRef } from 'react'
import './App.css'
import { Auth } from './components/Auth.jsx'
import Cookies from 'universal-cookie'
import { Chat } from './components/Chat.jsx'
import { signOut } from 'firebase/auth'
import { auth } from './firebase-config.js'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DebugEncrypted from './pages/DebugEncrypted.jsx'
import abstractBg from './assets/abstract_bg.png'

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
      <div className="App bg-gray-50">
        <Auth setIsAuth={setIsAuth} />
      </div>
    )
  }

  return (
    <div className="App min-h-screen relative w-full overflow-hidden bg-[#0a0a0f] text-white font-sans flex items-center justify-center p-4">
      <img src={abstractBg} className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-unmultiply" alt="Abstract Background" />
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black via-transparent to-black opacity-50 z-0 pointer-events-none"></div>

      {room ? (
        <div className="w-full max-w-4xl h-[90vh] bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-10 transition-all">
          <div className="bg-black/20 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm z-10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 font-light text-xl border border-indigo-500/30 shadow-inner">
                {room.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-light tracking-wider text-white">{room}</h1>
                <p className="text-[10px] text-indigo-200/50 font-light tracking-widest uppercase mt-0.5">End-to-End Encrypted</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setRoom(""); setRoomPassword(""); }}
                className="px-5 py-2.5 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              >
                Leave
              </button>
              <button 
                onClick={handleSignOut}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-500/80 hover:bg-red-500/90 rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative bg-transparent">
            <Chat room={room} roomPassword={roomPassword} />
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md relative z-10 transform transition-all hover:scale-[1.02] duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-indigo-300/20 shadow-inner backdrop-blur-md">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-light tracking-wider text-white">Join Secure Chat</h1>
            <p className="text-indigo-200/50 mt-2 text-sm font-light">Enter room details to start chatting securely.</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-medium text-white/50 mb-2">Room Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <input 
                  ref={roomInputRef} 
                  placeholder="e.g. secret-meeting"
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-black/20 text-white placeholder-white/30 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && setRoom(roomInputRef.current.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-medium text-white/50 mb-2">Encryption Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  onChange={(e) => setRoomPassword(e.target.value)}
                  value={roomPassword}
                  placeholder="Optional (but recommended)"
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-black/20 text-white placeholder-white/30 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && setRoom(roomInputRef.current.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={() => setRoom(roomInputRef.current.value)}
              className="w-full mt-8 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-100 font-medium py-3.5 px-4 border border-indigo-500/30 rounded-xl transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              Enter Room
            </button>
            
            <div className="pt-6 mt-6 border-t border-white/10">
              <button 
                onClick={handleSignOut}
                className="w-full bg-white/5 hover:bg-white/10 text-white/70 font-medium py-3.5 px-4 border border-white/10 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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