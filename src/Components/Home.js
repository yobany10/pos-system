import {useNavigate} from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()

    return (
        <div>
            <div className='grid bg-neutral-50 h-screen'>
                <div className='grid justify-self-center self-center text-center px-6 gap-4'>
                    <h1 className='font-bold text-7xl sm:text-8xl md:text-8xl lg:text-9xl xl:text-9xl justify-self-center text-blue-500'>POS PRO</h1>
                    <h1 className='font-bold text-4xl sm:text-5xl md:text-5xl lg:text-7xl xl:text-7xl justify-self-center'>Minimal.Fast.Easy</h1>
                    <p className='font-bold text-sm sm:text-lg md:text-lg lg:text-2xl xl:text-2xl justify-self-center'>An easy-to-use Point of Sale system. Great for fundraisers!</p>
                    <button type='button' className=' bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 text-white' onClick={() => navigate('/login')}>Get Started</button>
                </div>
            </div>
        </div>
    )
}

export default Home