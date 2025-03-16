import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React, { useEffect, useState } from 'react';
import { getWindowDimensions } from "./App.tsx";
import {referenceObj, shopList} from "./Reference_objects.tsx";
import "./cameraUI.css"
import "./index.css"
import { ToastContainer, toast } from 'react-toastify';
// import { ScreenState } from "./Screen_state.tsx";

// camera module from https://github.com/jamenamcinteer/react-qr-barcode-scanner

let setScannerResult: React.Dispatch<React.SetStateAction<string>> // setter for scanner result
let setScanningState: React.Dispatch<React.SetStateAction<boolean>>
let setLoadingList: React.Dispatch<React.SetStateAction<boolean>>

const cameraHeight = 0.4 // in percentage ofc

const getDefaultFontSize = () => {

    const element = document.createElement('div');
    element.style.width = '1rem';
    element.style.display = 'none';
    document.body.append(element);
    const widthMatch = window
        .getComputedStyle(element)
        .getPropertyValue('width')
        .match(/\d+/);
    element.remove();
    if (!widthMatch || widthMatch.length < 1) {
        return 1; // if the function ever return 1 we have bigger issues
    }

    const result = Number(widthMatch[0]);
    return !isNaN(result) ? result : 1;
};

const LocateStore: React.FC = () => {

    const [result, setResult] = useState("");
    const [scanning, setScanning] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [promptHeight, setPromptHeight] = useState(0);
    const [selectedStore, setSelectedStore] = useState(-1 as number);

    setScannerResult = setResult
    setScanningState = setScanning;
    setLoadingList = setLoading
    const defaultFontSize = getDefaultFontSize()
    const fullHeight = (windowDimensions.height / defaultFontSize - 4) * defaultFontSize
    const fullWidth = (windowDimensions.width / defaultFontSize - 4) * defaultFontSize

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

    useEffect(() => {
        setPromptHeight((document.getElementById("promptDiv") as HTMLDivElement).clientHeight)
    }, [document.getElementById("promptDiv") as HTMLDivElement]);

    const cameraUIvars = {
        "--UI-height": String(fullHeight) + "px",
        "--camera-height": String(fullHeight * cameraHeight) + "px",
        "--content-height": String(fullHeight * (1 - cameraHeight)) + "px",
    } as React.CSSProperties

    const list = (list: referenceObj) => {
        if (loading) {
            return (
                <>
                    <p>Loading...</p>
                </>
            )
        }

        const output: Element[] = []
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        for (let i = 0; i < list.value.length; i++) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const shopName: string = (list.value as Array<string>)[i]["name"]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const shopAddress: string = (list.value as Array<string>)[i]["address"]
            output.push((<div className={"shopContainer"} onClick={() => {notify(i)}}><p className={"mainText"}>{shopName}</p><p className={"otherText"}>{shopAddress}</p></div>) as unknown as Element)
        }
        output.push((<ToastContainer autoClose={5000} onClick={() => {console.log("hi")}}/>) as unknown as Element)
        return output
    }

    const notify = (i: number) => toast((<><p>Please click on this message to confirm you are in this store:</p>
        <br /><p>{(shopList.value as Array<string>)[i]["name" as unknown as number]}</p></>));
    
    return (
        <>
            <div id={"cameraUIWrapper"} style={cameraUIvars}>
                <div id={"cameraDiv"}>
                    <BarcodeScannerComponent
                        width={fullWidth}
                        height={fullHeight * cameraHeight}
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
                </div>
                {/*<Modal opened={opened} onClose={close} title={"Please confirm the selected store"}>*/}
                {/*    <p>hi</p>*/}
                {/*    <p>{(shopList.value as Array<string>)[selectedStore]}</p>*/}
                {/*</Modal>*/}
                <div id={"contentDiv"}>
                    <div id={"promptDiv"}>
                        <p>Please allow camera permissions, or choose a store from the list below</p>
                    </div>
                    <div id={"listDiv"} style={ { "--prompt-height": String(promptHeight) + "px" } as React.CSSProperties }>
                        {list(shopList)}
                    </div>
                </div>
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

    if (response.slice(0, 4) == "LIST") { // backend sends this back if either/both username and password is wrong
        response = response.slice(4, response.length)
        shopList.value = JSON.parse(response)["list"]
        setLoadingList(false) // if the server is too quick this will fail to run (almost impossible once deployed)

        return ""
    }

    return "4" // should not do anything, remove this later
}

export default LocateStore