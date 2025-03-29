import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React, {ReactNode, useEffect, useState} from 'react';
import {getWindowDimensions, setLoadingList, socket} from "../shared/Shared_objs.tsx";
import {nonce, referenceObj, shopList, storeID} from "../shared/Shared_objs.tsx";
import "../../cameraUI.css"
import "../../index.css"
import { ToastContainer, toast } from 'react-toastify';
import {getDefaultFontSize} from "../shared/getDefaultFontSize.tsx";

// 3 = store locator
    // a. check items: token, username
    // b. do regular status checks until user scans/inputs a store***
    // c. client asks for the list of stores with "3LIST"***
    // d. server pings down the list of stores, in a json that is just an array of jsons with the header of "list" appended by "3LIST"
        // each array member will contain "shop_list" and "address"
    // e. client then displays the full store list in a drop down***
        // the qr code would contain a valid copy of the store list entry the qr code is for
        // if user scans before step c is complete store the scanned value in a buffer and then check against it when step c is done***
    // f. client then double checks with user on store selection and sends the id of the store as "3STORE[id]" and also stores the store id***
    // g. server sends an ACK
    // h. client moves onto the main app***

// camera module from https://github.com/jamenamcinteer/react-qr-barcode-scanner

let setScanningState: React.Dispatch<React.SetStateAction<boolean>>

const cameraHeight = 0.4 // in percentage ofc

const LocateStore: React.FC = () => {

    const [scanning, setScanning] = useState(true);
    const [loading, setLoading] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [promptHeight, setPromptHeight] = useState(0);

    // setScannerResult = setResult
    setScanningState = setScanning;
    setLoadingList.value = setLoading
    const defaultFontSize = getDefaultFontSize()
    const fullHeight = (windowDimensions.height / defaultFontSize - 4) * defaultFontSize
    const fullWidth = (windowDimensions.width / defaultFontSize - 4) * defaultFontSize

    // useEffect(() => {
    //     if(result){
    //         alert(result)
    //     }
    // }, [result])

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
            output.push((<div className={"shopContainer"} onClick={() => {notify(i)}}><p className={"mainText"}>{shopName}</p><p className={"otherText"}>{shopAddress}</p></div>) as unknown as HTMLElement)
        }
        output.push((<ToastContainer autoClose={5000} onClick={() => {if (storeID.value != -1) {socket.send(nonce.value + "3STORE" + storeID.value)}}}/>) as unknown as Element)
        return output // 3e. displaying list
    }

    const notify = (i: number) => {
        storeID.value = i
        switch (i) { // the notify function outside should have done the error checking by this point
            case -1: // if the code was not recognizes run this
                toast.error((<><p>Invalid Code Scanned</p></>), {
                    onClose: () => {
                        setScanning(true)
                    }
                })
                break
            default: // normal behaviour
                toast((<>
                    <p>Please click on this message to confirm you are in this store:</p>
                    <br/>
                    <p>{(shopList.value as Array<string>)[i]["name" as unknown as number]}</p>
                </>), {
                    onClose: () => {
                        storeID.value = -1
                        setScanning(true)
                    }
                });
        }
    }; // 3f.
    
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
                                    while (loading) {
                                        // do nothing
                                    }
                                    // the scanned value would be a json
                                    // const scanned_value = "{\"name\":\"Manchester Piccadilly Station Store\",\"address\":\"B6/F, Piccadilly Railway Station, London Rd, Manchester M1 2PA\"}"
                                    setScanning(false)
                                    let found = false;
                                    const scanned_value = value.getText()
                                    for (let i = 0; i < (shopList.value as Array<string>).length; i++) {
                                        if (scanned_value == JSON.stringify((shopList.value as Array<string>)[i])) {
                                            storeID.value = i
                                            found = true;
                                            notify(i)
                                            break
                                        }

                                    }

                                    if (!found) {
                                        notify(-1)
                                        // toast.error("value scanned: " + value.getText())
                                        console.log("invalid value scanned:", value.getText());
                                    }
                                    // resolveScan(value.getText())
                                } else {
                                    // console.log("scanned nothing at " + (new Date().getTime()));
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
                        {list(shopList) as ReactNode}
                    </div>
                </div>
            </div>
        </>
    )

}

export default LocateStore