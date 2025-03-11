import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React, { useEffect, useState } from 'react';
import {getWindowDimensions, referenceObj} from "./App.tsx";
// import {ScreenState} from "./Screen_state.tsx";

// camera module from https://github.com/jamenamcinteer/react-qr-barcode-scanner

let setScannerResult: React.Dispatch<React.SetStateAction<string>> // setter for scanner result
let setScanningState: React.Dispatch<React.SetStateAction<boolean>>
// let setLoadingList: React.Dispatch<React.SetStateAction<boolean>>
let receivingList = false

const shopListArray: string[] = []
const shopList = new referenceObj(shopListArray)

const LocateStore: React.FC = () => {

    const [result, setResult] = useState("");
    const [scanning, setScanning] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, _setLoading] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    setScannerResult = setResult
    setScanningState = setScanning;
    // setLoadingList = setLoading

    useEffect(() => {
        if(result){
            alert(result)
        }
    }, [result])

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const list = () => {
        return loading ? (
            <>
                <option>Loading...</option>
            </>
        ) : (
            <>
                <option>placeholder</option>
            </>
        )
    }

    return (
        <>
            <div>
                {/*<Scanner*/}
                {/*    components = {{audio: false}}*/}
                {/*    allowMultiple={true}*/}
                {/*    onScan={handleScan}*/}
                {/*    onError={handleError} />*/}
                <BarcodeScannerComponent
                    width={windowDimensions.width}
                    height={windowDimensions.height * 0.4}
                    onUpdate={(_err: unknown, value) => { // this will run pretty much constantly as even when there isnt a code scanned it will run
                        if (scanning) {
                            if (value) {
                                setScanningState(false)
                                resolveScan(value.getText())
                            } else {
                                // do nothing
                            }
                        }
                    }}
                    delay={1000} // i am guessing this is 1000 millis???
                />
                <select>
                    {list()}
                </select>
            </div>
        </>
    )

}

function resolveScan(result: string){
    setScannerResult(result)
    setScanningState(true)
}

export const store_locator_screen = (socket: WebSocket, response: string, /*screen: referenceObj,*/ nonce: referenceObj) => {
    // message handler for store locator screen

    function pushShopList(response: string, shopList: referenceObj) {
        if (response.slice(response.length - 3, response.length) === "END") {
            receivingList = false
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        shopList.value.push(response)
    }

    if (receivingList) {
        pushShopList(response, shopList)
    } else {
        if (response.slice(0, 4) == "LIST") { // backend sends this back if either/both username and password is wrong
            receivingList = true
            response.replace("LIST", "")
            pushShopList(response, shopList)
            socket.send(nonce.value + "3ACK")
            return ""
        } else if (response.slice(0, 7) == "BADFORM") {
            alert(response.replace("BADFORM", ""))
            return ""
        }
    }
    return "4"
}

export default LocateStore