import {useEffect, useState} from 'react'
import {auth, db} from '../Firebase/config'
import {useNavigate} from 'react-router-dom'
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {useAuthState} from 'react-firebase-hooks/auth'
import {toast} from 'react-toastify'
import {AiOutlineClose} from 'react-icons/ai'

const defaultItemState = {name: '', description: '', price: 0.00}

const EditItems = ({isModal = false, onClose, onSaved}) => {
    const [item, setItem] = useState(defaultItemState)
    const [isSaving, setIsSaving] = useState(false)
    const [user] = useAuthState(auth)
    const navigate = useNavigate()

    const toastConfig = {
        position: 'bottom-left'
    }
    
    const submitItem = async (e) => {
        e.preventDefault()

        if (!user) {
            return
        }

        // Run checks for name
        if (item.name === '') {
            toast.error('Please name your product.', toastConfig)
            return;
        }
        if (item.description.length > 300) {
            toast.error('Item description is too long.', toastConfig)
            return;
        }
        // Get a reference to the "items" collection
        const itemsRef = collection(db, 'items')
        // Post an item to db
        try {
            setIsSaving(true)
            await addDoc(itemsRef, {
                ...item,
                price: priceFormat(item.price),
                timestamp: serverTimestamp(),
                user: user.uid,
                avatar: user.photoURL,
                username: user.displayName
            })
            setItem(defaultItemState)

            if (onSaved) {
                onSaved()
                return
            }

            navigate('/dashboard')
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        console.log(item)
    }, [item])

    const priceFormat = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2)
    }

    const form = (
        <form onSubmit={submitItem} className={`grid gap-4 rounded-xl bg-white p-4 drop-shadow-md ${isModal ? 'w-full' : 'w-96'}`}>
            <div className='flex items-start justify-between gap-4'>
                <h1 className='text-3xl font-bold'>{isModal ? 'Add a new item' : 'Add a new item'}</h1>
                {isModal && (
                    <button type='button' onClick={onClose} className='rounded p-2 text-neutral-500 hover:bg-slate-100 hover:text-slate-900'>
                        <AiOutlineClose />
                    </button>
                )}
            </div>
            <label className='grid gap-2 justify-self-center w-full'>
                <p className='font-bold'>Name:</p>
                <input
                    value={item.name}
                    onChange={(e) => setItem(item => {
                        let newItem = {...item}
                        newItem.name = e.target.value
                        return newItem
                    })}
                    type='text'
                    className='justify-self-center w-full rounded text-black px-1 border border-gray-300'
                ></input>
            </label>
            <label className='grid gap-2 justify-self-center w-full'>
            <p className='font-bold'>Description:</p>
                <textarea
                    value={item.description}
                    onChange={(e) => setItem(item => {
                        let newItem = {...item}
                        newItem.description = e.target.value
                        return newItem
                    })}
                    type='text'
                    className='justify-self-center w-full rounded text-black px-1 border border-gray-300'
                ></textarea>
                <p className={`text-slate-400 text-xs ${item.description.length > 300 ? 'text-red-300' : ''}`}>{item.description.length}/300</p>
            </label>
            <label className='grid gap-2 justify-self-center w-full'>
            <p className='font-bold'>Price:</p>
                <input
                    value={item.price}
                    onChange={(e) => setItem(item => {
                        let newItem = {...item}
                        newItem.price = e.target.value
                        return newItem
                    })}
                    type='number'
                    name='price'
                    step='0.01'
                    className='justify-self-center w-full rounded text-black px-1 border border-gray-300'
                ></input>
            </label>
            <div className='flex justify-end gap-3'>
                {isModal && (
                    <button type='button' onClick={onClose} className='rounded border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100'>Cancel</button>
                )}
                <button type='submit' disabled={isSaving} className='justify-self-end rounded bg-blue-500 px-8 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300'>
                    {isSaving ? 'Saving...' : 'Add'}
                </button>
            </div>
        </form>
    )

    return (
        isModal ? (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
                <div className='w-full max-w-lg'>
                    {form}
                </div>
            </div>
        ) : (
            <div className='h-screen'>
                <div className='mx-auto my-10 w-96'>
                    {form}
                </div>
            </div>
        )
    )
}

export default EditItems