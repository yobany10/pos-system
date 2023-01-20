import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../Firebase/config"
import { useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect } from "react"
import { FcGoogle } from "react-icons/fc";

const Login = () => {
    const navigate = useNavigate()
    const [user, loading] = useAuthState(auth)
    const googleProvider = new GoogleAuthProvider()
    // Sign in with Google
    const GoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        } else {
            return
        }
    },[user])

    return (
        <div className="grid mt-24">
            <div className='grid gap-8 bg-white justify-self-center p-8 rounded drop-shadow-md'>
                <div className='grid'>
                    <h1 className='text-3xl font-bold justify-self-center'>Welcome!</h1>
                    <p className='text-md justify-self-center'>Getting started is easy. Just sign in below.</p>
                </div>
                <button
                type="button"
                onClick={GoogleLogin}
                className='flex gap-2 justify-self-center text-md bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded px-4 py-2'
                ><FcGoogle className='inline self-center' />Sign in with Google</button>
            </div>
        </div>
    )
}

export default Login