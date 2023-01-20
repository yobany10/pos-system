import {db} from '../Firebase/config'
import {doc, deleteDoc} from 'firebase/firestore'
import {useNavigate} from 'react-router-dom'
import {AiFillEdit, AiFillDelete} from 'react-icons/ai'

const Item = (props) => {
    const navigate = useNavigate()

    const deleteItem = async (getItems) => {
        await deleteDoc(doc(db, 'items', `${props.item.id}`))
    }

    return (
        <div className='grid grid-flow-row gap-2 max-w-xs bg-white rounded p-2 drop-shadow-md'>
            <p className='font-bold'>{props.item.name}</p>
            <p>{props.item.description}</p>
            <div className='flex justify-between self-end'>
                <p className='text-orange-500'>${props.item.price}</p>
                <div className='flex'>
                    <AiFillEdit className='text-neutral-500 hover:text-blue-500 cursor-pointer m-2' onClick={() => navigate(`/update-item/${props.item.id}`)} />
                    <AiFillDelete className='text-neutral-500 hover:text-red-500 cursor-pointer m-2' onClick={deleteItem} />
                </div>
            </div>
        </div>
    )
}

export default Item