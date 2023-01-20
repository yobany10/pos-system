import {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {db, auth} from '../Firebase/config'
import {doc, addDoc, getDoc, deleteDoc, collection, query, where, orderBy, onSnapshot, updateDoc, serverTimestamp} from 'firebase/firestore'
import {useAuthState} from 'react-firebase-hooks/auth'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
import {AiFillEdit, AiFillDelete} from 'react-icons/ai'
import SellItem from './SellItem'
import OrderItem from './OrderItem'

const Sell = () => {
    const [allItems, setAllItems] = useState([])
    const [order, setOrder] = useState({clientName: '', totalDue: 0, changeNeeded: 0, amountPaid: 0, changeReturned: 0})
    const [orderItems, setOrderItems] = useState([])
    const [transactions, setTransactions] = useState([])
    const [transactionStats, setTransactionStats] = useState({salesTotal: 0, totalPaid: 0, totalLeftToPay: 0})
    const [eventName, setEventName] = useState('')
    const [renderEventSubmit, setRenderEventSubmit] = useState(false)
    const {saleid} = useParams()
    const [sellView, setSellView] = useState(true)
    const [user, loading] = useAuthState(auth)
    const navigate = useNavigate()

    const toastConfig = {
        position: 'bottom-left'
    }

    const getItems = async () => {
        const q = query(collection(db, 'items'), where('user', '==', `${user.uid}`), orderBy('name', 'asc'))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.map(doc => console.log(doc.data()))
            setAllItems(querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id, quantity: 0})))
        })
        return unsubscribe
    }

    const getEvent = async () => {
        const eventRef = doc(db, 'saleEvents', saleid)
        const eventSnap = await getDoc(eventRef)
        if (eventSnap.exists()) {
            setEventName(eventSnap.data().name)
        } else {
            console.log('Document does not exist')
        }
    }

    const getOrders = async () => {
        const q = query(collection(db, 'orders'), where('saleEventId', '==', `${saleid}`), orderBy('clientName', 'asc'))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.docs.map(doc => console.log(doc.data()))
            setTransactions(querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id})))
        })
        return unsubscribe
    }

    const handleNameUpdate = async (e) => {
        e.preventDefault()
        // Post new name to db
        try {
            await updateDoc(doc(db, 'saleEvents', saleid), {
                name: eventName
            }) 
        } catch (error) {
            console.log(error)
        }
        setRenderEventSubmit(false)
        toast.success('Event name saved', toastConfig)
    }

    const handleOrderSubmit = async (e) => {
        e.preventDefault()
        if (order.clientName == '') {
            toast.error('Please add a client name before submitting',toastConfig)
            return
        }
        if (orderItems.length == 0) {
            toast.error('Please add an item before submitting',toastConfig)
            return
        }
        const orderRef = collection(db, 'orders')
        try {
            await addDoc(orderRef, {
                clientName: order.clientName,
                totalDue: priceFormat(order.totalDue),
                changeNeeded: priceFormat(order.changeNeeded),
                amountPaid: priceFormat(order.amountPaid),
                changeReturned: priceFormat(order.changeReturned),
                saleEventId: saleid,
                user: user.uid,
                avatar: user.photoURL,
                username: user.displayName,
                orderItems: [...orderItems],
                timestamp: serverTimestamp()
            })   
        } catch (error) {
            console.log(error)
        }
        setOrder({clientName: '', totalDue: 0, changeNeeded: 0, amountPaid: 0, changeReturned: 0})
        setOrderItems([])
        let allItemsTemp = [...allItems]
        allItemsTemp.forEach((item, index) => {
            allItemsTemp[index].quantity = 0
        })
        setAllItems(allItemsTemp)
        toast.success('Order submitted',toastConfig)
    }

    const updateTransactionStats = () => {
        if (transactions.length == 0) {
            return
        }
        const transactionStatsTemp = {...transactionStats}
        let salesTotal = transactions.map(item => Number(item.totalDue)).reduce((acc, curr) => acc + curr)
        transactionStatsTemp.salesTotal = salesTotal
        let totalPaid = transactions.map(item => Number(item.amountPaid)).reduce((acc, curr) => acc + curr)
        transactionStatsTemp.totalPaid = totalPaid
        let totalLeftToPay = (salesTotal - totalPaid)
        transactionStatsTemp.totalLeftToPay = totalLeftToPay
        setTransactionStats(transactionStatsTemp)
    }

    const handleOrderDelete = async (id) => {
        await deleteDoc(doc(db, 'orders', `${id}`))
    }

    useEffect(() => {
        getEvent()
        getOrders()
    },[])

    useEffect(() => {
        updateTransactionStats()
    },[transactions])

    // See if the user is logged in
    const checkAuth = async () => {
        if (user) {
            getItems()
            return;
        }
        if (loading) return;
        if (!user) return navigate('/login')
    }

    useEffect(() => {
        checkAuth()
    },[user, loading])

    useEffect(() => {
        let allItemsTemp = [...allItems]
        let orderItemsTemp = []
        allItemsTemp.forEach(item => {
            if (item.quantity > 0) {
                orderItemsTemp.push(item)
            }
        })
        setOrderItems(orderItemsTemp)
    }, [allItems])

    useEffect(() => {
        if (orderItems.length > 0) {
            let orderTemp = {...order}
            let totalDue = [...orderItems].map(item => item.price * item.quantity).reduce((acc, curr) => acc + curr)
            orderTemp.totalDue = totalDue
            let changeNeeded = orderTemp.amountPaid - orderTemp.totalDue
            orderTemp.changeNeeded = changeNeeded
            setOrder(orderTemp)
        } else {
            let orderTemp = {...order}
            let totalDue = priceFormat(0)
            let changeNeeded = priceFormat(0)
            orderTemp.totalDue = totalDue
            orderTemp.changeNeeded = changeNeeded
            setOrder(orderTemp)
        }
    }, [orderItems])

    const priceFormat = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2)
    }

    return (
        <div className='bg-neutral-50 h-screen'>
            <div className='grid py-2 px-4 bg-slate-200'>
                <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-w-screen-xl w-full m-auto'>
                    <form className='h-min justify-self-center sm:justify-self-center md:justify-self-start lg:justify-self-start xl:justify-self-start' onSubmit={handleNameUpdate}>
                        <label>
                            Event name:
                            <input type='text' className='justify-self-start rounded text-black px-1 mx-2'
                            value={eventName}
                            onChange={(e) => {
                                setEventName(e.target.value)
                                setRenderEventSubmit(true)
                            }}
                            ></input>
                        </label>
                        {renderEventSubmit && <button type='submit' className='bg-blue-500 hover:bg-blue-600 rounded text-white px-4'>Submit</button>}
                    </form>
                    <div className='flex justify-self-center sm:justify-self-center md:justify-self-end lg:justify-self-end xl:justify-self-end h-min'>
                        <button type='button' onClick={() => setSellView(true)} className={`text-sm px-2 rounded-l-full border ${sellView ? 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white' : 'bg-neutral-50 border-blue-500 text-blue-500 hover:text-blue-600'}`}>Create Order</button>
                        <button type='button' onClick={() => setSellView(false)} className={`text-sm px-2 rounded-r-full border ${sellView ? 'bg-neutral-50 border-blue-500 text-blue-500 hover:text-blue-600' : 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white'}`}>View Transactions</button>
                    </div>
                </div>
            </div>
            <div id='table-view' className={`grid p-4 ${sellView ? 'hidden' : ''}`}>
            {transactions.length == 0 && 
            <div className='text-center justify-self-center self-center bg-blue-500 hover:bg-blue-600 text-white rounded w-max p-4 my-8 cursor-pointer' onClick={() => setSellView(true)}>
                <h1 className='text-3xl font-bold'>No Transactions Yet...</h1>
                <p className='text-md'>Click here to get started!</p>
            </div>
            }
            {transactions.length > 0 && 
                <div className='grid gap-4 max-w-screen-xl justify-self-center py-8'>
                <h1 className='text-2xl font-bold'>Transactions</h1>
                <div className='bg-white justify-self-start px-4 py-2 rounded drop-shadow-md'>
                    <span className='flex gap-2'><p className='text-md font-bold inline'>Total Sales</p><p className='text-md inline'>${priceFormat(transactionStats.salesTotal)}</p></span>
                    <span className='flex gap-2'><p className='text-md font-bold inline'>Total Paid</p><p className='text-md inline'>${priceFormat(transactionStats.totalPaid)}</p></span>
                    {transactionStats.totalLeftToPay > 0 && <span className='flex gap-2'><p className='text-md font-bold inline'>Clients Owe</p><p className='text-md inline'>${priceFormat(transactionStats.totalLeftToPay)}</p></span>}                
                    {transactionStats.totalLeftToPay < 0 && <span className='flex gap-2'><p className='text-md font-bold inline'>You Owe</p><p className='text-md inline'>${priceFormat(transactionStats.totalLeftToPay * -1)}</p></span>}                
                </div>
                <table className='drop-shadow-md rounded overflow-hidden'>
                    <thead>
                        <tr className='bg-blue-500 text-white'>
                            <th className='px-4 py-3 text-sm text-left'>Actions</th>
                            <th className='px-4 py-3 text-sm text-left'>Client Name</th>
                            <th className='px-4 py-3 text-sm text-left'>Total Due</th>
                            <th className='px-4 py-3 text-sm text-left'>Amount Paid</th>
                            <th className='px-4 py-3 text-sm text-left'>Change Needed</th>
                            <th className='px-4 py-3 text-sm text-left'>Change Returned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 && transactions.map(item => {
                            return <tr key={item.id}>
                                        <td className='border-b-2 border-slate-200 bg-white px-2 py-2'>
                                            {/* <AiFillEdit className='inline text-lg text-neutral-500 hover:text-blue-500 cursor-pointer mx-2' /> */}
                                            <AiFillDelete className='inline text-lg text-neutral-500 hover:text-red-500 cursor-pointer mx-2' onClick={() => handleOrderDelete(item.id)} />
                                        </td>
                                        <td className='border-b-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold'>{item.clientName}</td>
                                        <td className='border-b-2 border-slate-200 bg-white px-4 py-2 text-sm'>${item.totalDue}</td>
                                        <td className='border-b-2 border-slate-200 bg-white px-4 py-2 text-sm'>${item.amountPaid}</td>
                                        <td className='border-b-2 border-slate-200 bg-white px-4 py-2 text-sm'>${item.changeNeeded}</td>
                                        <td className='border-b-2 border-slate-200 bg-white px-4 py-2 text-sm'>${item.changeReturned}</td>
                                    </tr>
                        })}
                    </tbody>
                </table>
                </div>
            } 
            </div>
            <div className={`p-4 ${sellView ? '' : 'hidden'}`}>
            <div className='grid gap-4 grid-cols-4 max-w-screen-xl m-auto py-8'>
                <div className='grid col-span-3 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4 h-min'>
                    {(allItems !== []) && allItems.map((item, index) => {
                        return <SellItem allItems={allItems} setAllItems={setAllItems} item={item} index={index} orderItems={orderItems} setOrderItems={setOrderItems} order={order} setOrder={setOrder} key={item.id} />
                    })}
                </div>
                <div className='grid bg-slate-200 rounded col-span-1 p-2 gap-4'>
                    <div>
                        <form>
                            <label className='grid gap-2 justify-self-center w-full'>
                                Client Name:
                                    <input type='text' value={order.clientName}
                                    onChange={(e) => {
                                        let orderTemp = order
                                        orderTemp.clientName = e.target.value
                                        setOrder({...orderTemp})
                                    }}
                                    className='justify-self-center w-full rounded text-black px-1'
                                    ></input>
                            </label>
                        </form>
                    </div>
                    <div className='grid gap-2'>
                        {orderItems.map(item => {
                            return <OrderItem item={item} key={item.id} />
                        })}
                    </div>
                    <div className='bg-blue-500 rounded p-2 text-white'>
                        <p className='text-sm'>Total Due: ${priceFormat(order.totalDue)}</p>
                        {order.changeNeeded > 0 && <p className='text-sm'>Change Needed: ${priceFormat(order.changeNeeded)}</p>}
                        {(order.totalDue - order.amountPaid) > 0 && <p className='text-sm'>Client Owes: ${priceFormat(order.totalDue - order.amountPaid)}</p>}
                    </div>
                    <form>
                        <label className='grid gap-2 justify-self-center w-full'>
                            Amount Paid:
                                <input type='number' step='0.01' value={order.amountPaid}
                                onChange={(e) => {
                                    let orderTemp = order
                                    orderTemp.amountPaid = e.target.value
                                    let changeNeeded = e.target.value - orderTemp.totalDue
                                    orderTemp.changeNeeded = changeNeeded
                                    setOrder({...orderTemp})
                                }}
                                className='justify-self-center w-full rounded text-black px-1'
                                ></input>
                        </label>
                        <label className='grid gap-2 justify-self-center w-full'>
                            Change Returned:
                                <input type='number' step='0.01' value={order.changeReturned}
                                onChange={(e) => {
                                    let orderTemp = order
                                    orderTemp.changeReturned = e.target.value
                                    setOrder({...orderTemp})
                                }}
                                className='justify-self-center w-full rounded text-black px-1'
                                ></input>
                        </label>
                    </form>
                    <button type='submit' className='bg-blue-500 hover:bg-blue-600 rounded text-white' onClick={handleOrderSubmit}>Submit</button>
                </div>
            </div>
            </div>
        </div>
    )
}

export default Sell