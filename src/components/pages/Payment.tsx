import {
    checkoutTotal,
    getGlobalShoppingList,
    getWindowDimensions,
    Item, nonce,
    screenStateObj, setPaymentSuccess, setPaymentTransfer, socket, toastPaymentError
} from "../shared/Shared_objs.tsx";
import {toast, ToastContainer} from "react-toastify";
import React, {ReactNode, useEffect, useState} from "react";
import "../../payment.css"
import {ScreenState} from "../shared/Screen_state.tsx";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export const Payment = () => {

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [success, setSuccess] = useState<boolean>(false);
    const [transferred, setTransferred] = useState<boolean>(false);

    setPaymentSuccess.value = setSuccess;
    setPaymentTransfer.value = setTransferred;
    toastPaymentError.value = (msg: string) => {
        toast.error(msg)
    }

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {

    }, [success, transferred]);

    const paymentUIvars = {
        "--UI-height": String(windowDimensions.height - 30) + "px",
    } as React.CSSProperties

    function showCheckoutList(shoppingList: Item[]) {
        // todo redo the display list logic/the display div structure
        const output: Element[] = []
        for (let i = 0; i < shoppingList.length; i++) {
            if (shoppingList[i].quantity <= 0){ // skip element if the quantity is 0
                continue
            }
            const item: Item = shoppingList[i]
            output.push((
                <div className={"checkoutContainer"}>
                    <p className={"mainText"}>{item.name}</p>
                    <p className={"otherText"}>{"£" + item.price + " = £" + (item.price * item.quantity).toFixed(2)}</p>
                    <p className={"warningText"}>{item.age_limit == 0 ? "" : "Age verification needed"}</p>
                </div>
            ) as unknown as HTMLElement)
        }
        output.push((<ToastContainer autoClose={5000}/>) as unknown as Element)
        return output;
    }

    function cardPay(){

    }

    function transfer() {

    }

    return success && !transferred ? (
        <>
            <h1>Payment Successful</h1>
            <p>Thanks for shopping with us</p>
        </>
    ) : !success && !transferred ? (
        <>
            <div id={"checkoutUIContainer"} style={paymentUIvars}>
                <div id={"listContainer"}>
                    {screenStateObj.value == ScreenState.Payment ?
                        showCheckoutList((getGlobalShoppingList.value as () => object)() as Item[]) as ReactNode
                        :
                        (<></>) as ReactNode}
                </div>
                <p id={"total"}>{"total: " + checkoutTotal.value}</p>
                <div id={"checkoutContainer"}>
                    <div id={"apple_googlePayContainer"} className={"paymentContainer"}>
                        <button id={"applePay"} onClick={() => {socket.send(nonce.value + "5APPLE")}}>Apple Pay</button>
                        <button id={"googlePay"} onClick={() => {socket.send(nonce.value + "5GOOGLE")}}>Google Pay</button>
                    </div>
                    <div id={"cardPayContainer"} className={"paymentContainer"}>
                        <input placeholder={"Card Number"} id={"cardNumber"}/>
                        <input placeholder={"Expiry Date (MM/YYYY)"} id={"expiryDate"}/>
                        <input placeholder={"CVV"} id={"cvv"}/>
                        <button id={"cardPay"} onClick={cardPay}>Pay by card</button>
                    </div>
                    <button id={"transfer"} onClick={transfer}>Transfer to till</button>
                </div>
            </div>
            <ToastContainer autoClose={5000}/>
        </>
    ) : !success && transferred ? (
        <>
            <h1>Transfer to till</h1>
            <p>Please scan the qr code shown on the till screen</p>
            <BarcodeScannerComponent
                width={windowDimensions.width}
                height={windowDimensions.height * 0.4}
                onUpdate={(_err: unknown, value) => { // this will run pretty much constantly as even when there isnt a code scanned it will run
                    if (value) {
                        socket.send(nonce.value + "5TRANSFER" + value.getText()) // 4c. sending id to backend
                    }
                }}
                delay={2000} // in millis
            />
            <ToastContainer autoClose={5000}/>
        </>
    ) : (
        <>
            <h1>Payment transferred to till</h1>
            <p>Please continue your payment according to instructions from the till</p>
        </>
    )
}