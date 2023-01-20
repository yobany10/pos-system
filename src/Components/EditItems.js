import {useEffect, useState} from 'react'
import {auth, db} from '../Firebase/config'
import {useNavigate} from 'react-router-dom'
import {addDoc, collection, serverTimestamp} from 'firebase/firestore'
import {useAuthState} from 'react-firebase-hooks/auth'
import {toast} from 'react-toastify'

const EditItems = () => {
    const [item, setItem] = useState({name: '', description: '', price: 0.00})
    const [user, loading] = useAuthState(auth)
    const navigate = useNavigate()

    const toastConfig = {
        position: 'bottom-left'
    }
    
    const submitItem = async (e) => {
        e.preventDefault()
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
        await addDoc(itemsRef, {
            ...item,
            price: priceFormat(item.price),
            timestamp: serverTimestamp(),
            user: user.uid,
            avatar: user.photoURL,
            username: user.displayName
        })
        setItem({name: '', description: '', price: 0.00})
        navigate('/dashboard')
    }

    useEffect(() => {
        console.log(item)
    }, [item])

    const priceFormat = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2)
    }

    return (
        <div className='h-screen'>
            <h1 className='text-3xl font-bold text-center mx-4 my-10'>Add a new item</h1>
            <form onSubmit={submitItem} className='grid gap-4 p-4 bg-white w-96 m-auto rounded-xl drop-shadow-md'>
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
                <button type='submit' className='justify-self-end px-8 bg-blue-500 hover:bg-blue-600 rounded text-white'>Add</button>
            </form>
        </div>
    )
}

export default EditItems