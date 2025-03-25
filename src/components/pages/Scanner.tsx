import React, {ReactNode, useEffect, useState} from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import {
    getGlobalShoppingList,
    getWindowDimensions,
    Item,
    nonce, scannerReload,
    scanningNotify,
    setGlobalShoppingList,
    socket,
    tempQuantity
} from "../shared/Shared_objs.tsx";
import {getDefaultFontSize} from "../shared/getDefaultFontSize.tsx";
import {toast, ToastContainer} from "react-toastify";

let setScanningState: React.Dispatch<React.SetStateAction<boolean>>

const cameraHeight = 0.4 // in percentage ofc

export const MainScanner: React.FC = () => {

    console.debug("MainScanner loaded");

    const [scanning, setScanning] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [inputHeight, setInputHeight] = useState(0)
    const [shoppingList, setshoppingList] = useState([] as Array<Item>);
    const [rerender, setRerender] = useState(false)
    setGlobalShoppingList.value = setshoppingList
    getGlobalShoppingList.value = () => {return shoppingList};
    setScanningState = setScanning;
    const defaultFontSize = getDefaultFontSize()
    const fullHeight = (windowDimensions.height / defaultFontSize - 4) * defaultFontSize
    const fullWidth = (windowDimensions.width / defaultFontSize - 4) * defaultFontSize

    useEffect(() => {

    }, [rerender]);

    scannerReload.value = () => {setRerender(!rerender)}

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setInputHeight((document.getElementById("inputDiv") as HTMLDivElement).clientHeight)
    }, [document.getElementById("inputDiv") as HTMLDivElement]);

    function showShoppingList(shoppingList: Item[]) {
        // todo redo the display list logic/the display div structure
        const output: Element[] = []
        for (let i = 0; i < shoppingList.length; i++) {
            if (shoppingList[i].quantity <= 0){ // skip element if the quantity is 0
                continue
            }
            const item: Item = shoppingList[i]
            output.push((
                <div className={"itemContainer"}>
                    <div className={"itemTextContainer"}>
                        <p className={"mainText"}>{item.name}</p>
                        <p className={"otherText"}>{"£" + item.price + " = £" + (item.price * item.quantity).toFixed(2)}</p>
                        <p className={"warningText"}>{item.age_limit == 0 ? "" : "Age verification needed"}</p>
                    </div>
                    <div className={"itemButtonContainer"}>
                        <button className={"listBtn"} onClick={() => {
                            shoppingList[i].quantity = shoppingList[i].quantity % 1 === 0 ? shoppingList[i].quantity - 1 : 0;
                            (scannerReload.value as () => void)()
                        }}>-</button><span className={"mainText quantityText"}>{item.quantity}</span>
                    </div>
                </div>
            ) as unknown as HTMLElement)
        }
        output.push((<ToastContainer autoClose={5000}/>) as unknown as Element)
        return output
    }

    useEffect(() => {
        setshoppingList(shoppingList)
    }, [shoppingList]);

    const cameraUIvars = {
        "--UI-height": String(fullHeight) + "px",
        "--camera-height": String(fullHeight * cameraHeight) + "px",
        "--content-height": String(fullHeight * (1 - cameraHeight)) + "px",
    } as React.CSSProperties

    scanningNotify.value = (name: string, quantity?: number) => { // todo
        console.log("notify " + name)
        switch (String(name)) { // the notify function outside should have done the error checking by this point
            case "-1": // if the code was not recognizes run this
                if (scanning) {
                    setScanning(false);
                    toast.error("Invalid barcode entered", {
                        onClose: () => {
                            setScanning(true)
                        }
                    })
                } else {
                    toast.error("Invalid barcode scanned", {
                        onClose: () => {
                            setScanning(true)
                        }
                    })
                }
                break
            case "-2": // if the code is recognized but quantity invalid run this
                if (scanning) {
                    setScanning(false);
                    toast.error("Invalid barcode scanned", {
                        onClose: () => {
                            setScanning(true)
                        }
                    })
                } else {
                    toast.error("Invalid quantity entered")
                }
                break
            default: // normal behaviour
                {
                    const quantityString = quantity !== 0.0 ? (" * " + String(quantity)) : ""
                    toast("Item inserted: " + name + quantityString, {
                        onClose: () => {
                            setScanning(true)
                        }
                    })
                }
        }
    }

    const getTotalCost = (): number => {
        let output = 0
        Array.from(shoppingList).forEach((item) => {
            output += item.price * item.quantity
        })
        return Number(output.toFixed(2))
    }

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
                                    // pretend this is what the scanner scanned in
                                    const scanned_value = "1 0.4" // todo format
                                    const scanned_value_array = scanned_value.split(" ")
                                    if (scanned_value_array.length == 2) {
                                        tempQuantity.value = scanned_value_array[1] as unknown as number
                                    }
                                    socket.send(nonce.value + "4ITEM" + scanned_value_array[0])
                                    // resolveScan(value.getText())
                                } else {
                                    // console.log("scanned nothing at " + (new Date().getTime()));
                                    // do nothing
                                }
                            }
                        }}
                        delay={100} // in millis
                    />
                </div>
                <div id={"contentDiv"}>
                    <div id={"inputDiv"}>
                        <input type={"text"} id={"item_input"} placeholder={"item id"}></input>
                        <input type={"text"} id={"quantity_input"} placeholder={"quantity"}></input>
                        <button id={"inputButton"} onClick={() => {
                            const quantityInput = (document.getElementById("quantity_input") as HTMLInputElement).value
                            if (isNaN(+quantityInput)) { // check if input is number
                                (scanningNotify.value as (name: string) => object)("-2")
                            } else {
                                tempQuantity.value = Number(quantityInput)
                                socket.send(
                                    nonce.value + "4ITEM" + (document.getElementById("item_input") as HTMLInputElement).value
                                )
                            }
                        }}>submit</button>
                    </div>
                    <div id={"listContainer"}>
                        {/* todo fix prompt height afterwards */}
                        <div id={"listDiv"} style={ { "--prompt-height": String(inputHeight + (getDefaultFontSize() * (2 + 0.7 + 0.7 + 0.5))) + 2 + "px" } as React.CSSProperties }>
                            {showShoppingList(shoppingList) as ReactNode}
                        </div>
                        <div id={"checkoutDiv"}>
                            <p>{"Total price: £" + getTotalCost()}</p>
                            <button id={"checkoutButton"}>Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}