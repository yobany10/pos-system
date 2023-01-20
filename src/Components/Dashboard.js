import { useEffect, useState } from "react"
import { auth, db } from "../Firebase/config"
import {addDoc, onSnapshot, getDocs, collection, where, query, orderBy, serverTimestamp} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import Item from './Item'
import SaleEventItem from './SaleEventItem'

const Dashboard = (props) => {
    const [allItems, setAllItems] = useState([])
    const [saleEvents, setSaleEvents] = useState([])
    const navigate = useNavigate()
    const [user, loading] = useAuthState(auth)

    const getItems = async () => {
        console.log('getting items')
        const q = query(collection(db, 'items'), where('user', '==', `${user.uid}`), orderBy('name', 'asc'))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.map(doc => console.log(doc.data()))
            setAllItems(querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
        })
        return unsubscribe
    }

    const getSaleEvents = async () => {
        console.log('getting sale events')
        const q = query(collection(db, 'saleEvents'), where('user', '==', `${user.uid}`), orderBy('name', 'asc'))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.map(doc => console.log(doc.data()))
            setSaleEvents(querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
        })
        return unsubscribe
    }

    // See if user is logged
    const checkAuth = async () => {
        if (user) {
            getItems()
            getSaleEvents()
            return;
        }
        if (loading) return;
        if (!user) return navigate('/login')
    }

    useEffect(() => {
        checkAuth()
    },[user, loading])

    const handleNewSale = async () => {
        try {
            const saleEventsRef = collection(db, 'saleEvents')
            const res = await addDoc(saleEventsRef, {
                name: '',
                timestamp: serverTimestamp(),
                user: user.uid,
                avatar: user.photoURL,
                username: user.displayName
            })
            navigate(`/sell/${res.id}`)
            console.log(res.id)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={`bg-neutral-50 ${allItems.length == 0 ? 'h-screen' : 'h-full'} max-w-screen-xl m-auto`}>
            {allItems.length == 0 && 
                <div className='grid py-12 text-center bg-orange-200 rounded-lg mx-8 mt-8'>
                    <div className='justify-self-center p-4 rounded'>
                        <h1 className='text-4xl font-bold'>It's a great day to sell!</h1>
                        <p className='text-md'>Add an item to get started</p>
                    </div>
                </div>
            }
            <div className={`grid gap-4 py-24 px-4`}>
                <h1 className="text-4xl font-bold">My Items</h1>
                <div className={`grid ${allItems.length == 0 ? 'grid-cols-1' : 'lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2'} gap-4 max-w-screen-lg`}>
                    {(allItems.length == 0) &&
                        <div className='border-2 border-dashed border-slate-400 p-12 rounded'>
                            <p>No items yet. Create one to get started selling!</p>
                        </div>
                    }
                    {(allItems !== []) && allItems.map(item => {
                        return <Item item={item} key={item.id} />
                    })}
                </div>
                <Link to='/edit-items' className='justify-self-start'>
                    <button type="button" className="bg-neutral-700 rounded px-2 text-white hover:bg-blue-500">Add an Item</button>
                </Link>
            </div>
            {allItems.length > 0 && 
                <div className='grid gap-4 bg-slate-200 mx-8 py-24 px-8 rounded-lg'>
                <h1 className="text-4xl font-bold">Ready to sell?</h1>
                <button type="button" onClick={handleNewSale} className="bg-neutral-700 rounded px-2 text-white hover:bg-blue-500 justify-self-start">Begin New Sale</button>
                </div>
            }
            <div className={`grid gap-4 ${allItems.length > 0 ? 'py-24' : 'py-12'} px-4`}>
            <h1 className="text-4xl font-bold">My Sales</h1>
            <div className={`grid ${allItems.length == 0 ? 'grid-cols-1' : 'lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2'} gap-4 max-w-screen-lg`}>
                {(saleEvents.length == 0) &&
                    <div className='border-2 border-dashed border-slate-400 p-12 rounded'>
                        <p>No sales yet...</p>
                    </div>
                }
                {(saleEvents !== []) && saleEvents.map(item => {
                    return <SaleEventItem item={item} key={item.id} />
                })}
            </div>
            </div>
        </div>
    )
}

export default Dashboard