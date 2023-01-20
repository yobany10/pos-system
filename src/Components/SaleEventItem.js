import {useNavigate} from 'react-router-dom'
import {doc, deleteDoc} from 'firebase/firestore'
import {db} from '../Firebase/config'
import {AiFillEdit, AiFillDelete} from 'react-icons/ai'

const SaleEventItem = (props) => {

    const navigate = useNavigate()

    const handleSaleEventDelete = async () => {
        await deleteDoc(doc(db, 'saleEvents', props.item.id))
    }

    return (
        <div className='grid grid-flow-row gap-2 max-w-xs bg-white rounded p-2 drop-shadow-md'>
            <p className='font-bold'>{props.item.name == '' ? 'Untitled Sale' : props.item.name}</p>
            <div className='flex justify-between self-end'>
                <p className='text-slate-500'>{props.item.timestamp != null && new Date(props.item.timestamp.seconds * 1000).toLocaleDateString()}</p>
                <div className='flex'>
                    <AiFillEdit className='text-neutral-500 hover:text-blue-500 cursor-pointer m-2' onClick={() => navigate(`/sell/${props.item.id}`)} />
                    <AiFillDelete className='text-neutral-500 hover:text-red-500 cursor-pointer m-2' onClick={handleSaleEventDelete} />
                </div>
            </div>
        </div>
    )
}

export default SaleEventItem