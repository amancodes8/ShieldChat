import { auth, provider } from "../firebase-config.js"
import { signInWithPopup } from "firebase/auth"
import Cookies from "universal-cookie"
const cookies = new Cookies()

export const Auth = (props) => {
    const { setIsAuth } = props;

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            console.log("Sign in successful:", result)
            // Use accessToken instead of refreshToken for better security
            cookies.set("auth-token", result.user.accessToken)
            setIsAuth(true)
        } catch (error) {
            console.error("Authentication error:", error);
        }
    }
    
    return (
        <div className="auth">
            <p>Sign In With Google To Continue</p>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
        </div>
    )
}