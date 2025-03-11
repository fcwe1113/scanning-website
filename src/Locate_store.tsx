import { Scanner } from '@yudiel/react-qr-scanner'

// camera module from https://github.com/yudielcurbelo/react-qr-scanner

const LocateStore: React.FC = () => {

    return (
        <>
        <div>
            <Scanner onScan={(result) => alert(result)} />
        </div>
        </>
    )
}

export default LocateStore