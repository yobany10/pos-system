import {useState, useRef, useEffect} from 'react' 
import { Routes, Route } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from './Firebase/config'
import { useAuthState } from 'react-firebase-hooks/auth'
import Home from './Components/Home'
import Dashboard from './Components/Dashboard'
import Login from './Auth/Login'
import EditItems from './Components/EditItems'
import UpdateItem from './Components/UpdateItem'
import Sell from './Components/Sell'
import useOutsideClick from './Hooks/useOutsideClick'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

function App() {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate()
  const menuRef = useRef()

  useOutsideClick(menuRef, () => {
    console.log('clicked outside')
    setShowAvatarMenu(false)
  })

  const toastConfig = {
    position: 'bottom-left'
  }

  const handleLogoutClick = () => {
    setShowAvatarMenu(false)
    auth.signOut()
    toast.info('You have been signed out', toastConfig)
  }

  const handleDashboardClick = () => {
    setShowAvatarMenu(false)
    navigate('/dashboard')
  }

  return (
    <div>
      <ToastContainer limit={1} />
      <nav className='grid grid-rows-auto grid-flow-col gap-4 bg-slate-900 py-3 px-4'>
        <div className='flex justify-self-start items-center'>
          <Link to={'/'}><p className='text-neutral-50 font-bold inline hover:text-blue-500'>POS PRO</p></Link>
        </div>
        <div className='flex gap-8 justify-self-end items-center'>
          {user && (<Link to={'/dashboard'}><p className='text-neutral-50 inline hover:text-blue-500'>Dashboard</p></Link>)}
          {user && (
          <div className='dropdown inline-block relative'>
            <img src={user.photoURL} onClick={() => setShowAvatarMenu(prev => !prev)} className='w-8 rounded-full cursor-pointer' referrerPolicy="no-referrer" />
            <ul ref={menuRef} className={`${showAvatarMenu ? 'block' : 'hidden'} dropdown-menu absolute bg-white drop-shadow-md rounded overflow-hidden`}>
              <li onClick={handleLogoutClick} className='text-blue-500 cursor-pointer hover:bg-slate-100 px-4 py-2'>Logout</li>
              <li onClick={handleDashboardClick} className='text-blue-500 cursor-pointer hover:bg-slate-100 px-4 py-2'>Dashboard</li>
            </ul>
          </div>
          )}
          {!user && (<Link to={'/login'}><p className='text-neutral-50 inline hover:text-blue-500'>Login</p></Link>)}
        </div>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={<Dashboard user={user} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/edit-items' element={<EditItems />} />
        <Route path='/update-item/:itemid' element={<UpdateItem />} />
        <Route path='/sell/:saleid' element={<Sell />} />
      </Routes>
    </div>
  );
}

export default App;
