import {useEffect, useState} from 'react'
import {auth, db} from '../Firebase/config'
import {setDoc, serverTimestamp, doc, getDoc} from 'firebase/firestore'
import {useAuthState} from 'react-firebase-hooks/auth'
import {toast} from 'react-toastify'
import {AiOutlineClose} from 'react-icons/ai'

const defaultItemState = {name: '', description: '', price: 0.00}

const UpdateItem = ({itemId, initialItem, onClose, onSaved, isModal = false}) => {
    const [item, setItem] = useState({name: '', description: '', price: 0.00})
    const [isSaving, setIsSaving] = useState(false)
    const [user] = useAuthState(auth)

    const toastConfig = {
        position: 'bottom-left'
    }

    const getItem = async () => {
        if (!itemId) {
            return
        }

        const itemRef = doc(db, 'items', `${itemId}`)
        const docSnap = await getDoc(itemRef);
        if (docSnap.exists()) {
            setItem({name: `${docSnap.data().name}`, description: `${docSnap.data().description}`, price: docSnap.data().price})
            console.log("Document data:", docSnap.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!", docSnap.data())
        }
    }

    const submitUpdate = async (e) => {
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
        // Post an item to db
        try {
            setIsSaving(true)
            await setDoc(doc(db, 'items', itemId), {
                ...item,
                price: priceFormat(item.price),
                timestamp: serverTimestamp(),
                user: user.uid,
                avatar: user.photoURL,
                username: user.displayName
            }) 
        } catch (error) {
            console.log(error)
        } finally {
            setIsSaving(false)
        }

        setItem(defaultItemState)

        if (onSaved) {
            onSaved()
        }
    }

useEffect(() => {
    if (initialItem) {
        setItem({
            name: `${initialItem.name ?? ''}`,
            description: `${initialItem.description ?? ''}`,
            price: initialItem.price ?? 0.00
        })
        return
    }

    getItem()
},[initialItem, itemId])

useEffect(() => {
    console.log(item)
})

const priceFormat = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
}

    const form = (
        <form onSubmit={submitUpdate} className={`grid gap-4 p-4 bg-white ${isModal ? 'w-full' : 'w-96'} rounded-xl drop-shadow-md`}>
            <div className='flex items-start justify-between gap-4'>
                <h1 className='text-3xl font-bold'>{isModal ? 'Edit item' : 'Update item'}</h1>
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
                    {isSaving ? 'Saving...' : 'Update'}
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

export default UpdateItem