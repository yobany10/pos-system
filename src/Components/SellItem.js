import {AiOutlineMinus, AiOutlinePlus} from 'react-icons/ai'

const SellItem = (props) => {

    const handleMinus = () => {
        if (props.item.quantity === 0) {
            return
        }
        const allItemsTemp = [...props.allItems]
        allItemsTemp[props.index].quantity -= 1
        props.setAllItems([...allItemsTemp])
    }

    const handlePlus = () => {
        const allItemsTemp = [...props.allItems]
        allItemsTemp[props.index].quantity += 1
        props.setAllItems([...allItemsTemp])
    }
    
    return (
        <div className='grid grid-flow-row gap-2 max-w-xs select-none bg-white rounded p-2 drop-shadow-md self-start'>
            <p className='font-bold'>{props.item.name}</p>
            <p>{props.item.description}</p>
            <p className='text-orange-500'>${props.item.price}</p>
            <div className='flex gap-2 justify-self-center bg-slate-100'>
                <AiOutlineMinus onClick={() => handleMinus()} className='px-4 py-1 box-content rounded self-center text-lg text-neutral-500 border border-neutral-200 cursor-pointer' />
                <p onClick={() => console.log(props.orderItems)} className='self-center select-none'>{props.item.quantity}</p>
                <AiOutlinePlus onClick={() => handlePlus()} className='px-4 py-1 box-content rounded self-center text-lg text-neutral-500 border border-neutral-200 cursor-pointer' />
            </div>
        </div>
    )
}

export default SellItem