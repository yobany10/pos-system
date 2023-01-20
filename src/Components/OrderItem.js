const OrderItem = (props) => {

    const priceFormat = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2)
    }

    return (
        <div className='bg-white px-2 self-start justify-self-stretch rounded drop-shadow-md'>
            <p className=''>{props.item.name}</p>
            <div className='flex justify-between'>
                <p className='text-orange-500'>${props.item.price}</p>
                <p className=''>x{props.item.quantity}</p>
                <p className=''>${priceFormat(props.item.price * props.item.quantity)}</p>
            </div>
        </div>
    )
}

export default OrderItem