import {db} from '../Firebase/config'
import {doc, deleteDoc} from 'firebase/firestore'
import {AiFillEdit, AiFillDelete} from 'react-icons/ai'

const Item = (props) => {
    const deleteItem = async (e) => {
        console.log('delete item')
        e.stopPropagation()
        await deleteDoc(doc(db, 'items', `${props.item.id}`))
    }

    return (
        <div className='grid grid-flow-row gap-2 max-w-xs bg-white rounded px-6 py-4 shadow-xl cursor-pointer' onClick={(e) => props.onEdit(e, props.item)}>
            <p className='font-bold text-lg'>{props.item.name}</p>
            <p className='text-gray-500'>{props.item.description}</p>
            <div className='flex justify-between self-end'>
                <p className='text-orange-500 font-bold'>${props.item.price}</p>
                <div className='flex'>
                    <AiFillEdit className='text-neutral-500 hover:text-blue-500 cursor-pointer m-2' onClick={(e) => props.onEdit(e, props.item)} />
                    <AiFillDelete className='text-neutral-500 hover:text-red-500 cursor-pointer m-2' onClick={deleteItem} />
                </div>
            </div>
        </div>
    )
}

export default Item