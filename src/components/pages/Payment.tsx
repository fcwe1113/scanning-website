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
    let forceTill = false;

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
            if (item.age_limit != 0) {
                forceTill = true;
            }
        }
        output.push((<ToastContainer autoClose={5000}/>) as unknown as Element)
        return output;
    }

    function sanitise() {
        let output = ""
        const cardNum = (document.getElementById("cardNumber") as HTMLInputElement).value
        const expiryDate = (document.getElementById("expiryDate") as HTMLInputElement).value
        const cvv = (document.getElementById("cvv") as HTMLInputElement).value

        // console.debug(cardNum, expiryDate, cvv)
        // console.debug(Number(expiryDate.slice(0, 2)), Number(expiryDate.slice(0, 2)) > 12)

        // card num: must be 16 digits long
        if (cardNum == ""){
            output += "please enter a card number\n"
        } else if (!(new RegExp('^\\d{16}$').test(cardNum))){
            output += "card number has to be 16 digits long\n"
        }

        // expiry date: MM/YYYY
        if (expiryDate == ""){
            output += "please enter an expiry date\n"
        } else if (!(new RegExp('^\\d{2}/\\d{4}$').test(expiryDate))) {
            output += "expiry date must be in the format of \"MM/YYYY\"\n"
        } else if (Number(expiryDate.slice(0, 2)) > 12){
            output += "invalid expiry month\n"
        } else if ((new Date(Number(expiryDate.slice(3, expiryDate.length)), Number(expiryDate.slice(0, 2)) - 1, 1, 0, 0, 0, 0)).valueOf() - Date.now() < 0) {
            output += "card expired\n"
        }

        // cvv: must be 3 digits long
        if (cvv == ""){
            output += "please enter a cvv\n"
        } else if (!(new RegExp('^\\d{3}$').test(cvv))){
            output += "cvv has to be 3 digits long\n"
        }

        return output
    }

    function cardPay(){
        if (sanitise() == "") {
            socket.send(nonce.value +
                "5CARD{\"number\":\"" + (document.getElementById("cardNumber") as HTMLInputElement).value +
                "\",\"expiry\":\"" + (document.getElementById("expiryDate") as HTMLInputElement).value +
                "\",\"cvv\":\"" + (document.getElementById("cvv") as HTMLInputElement).value + "\"}");
            console.debug("sent card details")
        } else {
            toast.error("Card info invalid:\n" + sanitise())
        }
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
                    {forceTill ? (<><p>Please continue at the till for staff to verify your age.</p></>) as ReactNode
                        : (<>
                        <div id={"apple_googlePayContainer"} className={"paymentContainer"}>
                            <button id={"applePay"} onClick={() => {socket.send(nonce.value + "5APPLE")}}>Apple Pay</button>
                            <button id={"googlePay"} onClick={() => {socket.send(nonce.value + "5GOOGLE")}}>Google Pay</button>
                        </div>
                        <div id={"cardPayContainer"} className={"paymentContainer"}>
                            <input placeholder={"Card Number"} id={"cardNumber"}/>
                            <input placeholder={"Expiry Date (MM/YYYY)"} id={"expiryDate"}/>
                            <input placeholder={"CVV"} id={"cvv"}/>
                            <button id={"cardPay"} onClick={cardPay}>Pay by card</button>
                        </div></>)
                    }

                    <button id={"transfer"} onClick={() => {setTransferred(true)}}>Transfer to till</button>
                </div>
            </div>
            <ToastContainer autoClose={5000}/>
        </>
    ) : !success && transferred ? (
        <>
            <div>
                <h1>Transfer to till</h1>
                <p>Please scan the qr code shown on the till screen</p>
                <BarcodeScannerComponent
                    width={windowDimensions.width * 0.8}
                    height={windowDimensions.height * 0.4}
                    onUpdate={(_err: unknown, value) => { // this will run pretty much constantly as even when there isnt a code scanned it will run
                        if (value) {
                            socket.send(nonce.value + "5TRANSFER" + value.getText())
                        }
                    }}
                    delay={2000} // in millis
                />
                <p>or please type in the code shown on the till screen</p>
                <input placeholder={"code"} id={"till_input"}/>
                <button onClick={() => {
                    if ((document.getElementById("till_input") as HTMLInputElement).value.length == 10) {
                        socket.send(nonce.value + "5TRANSFER" + (document.getElementById("till_input") as HTMLInputElement).value)
                    } else {
                        toast.error("Code invalid")
                    }
                }}>submit</button>
                <ToastContainer autoClose={5000}/>
            </div>
        </>
    ) : (
        <>
            <h1>Payment transferred to till</h1>
            <p>Please continue your payment according to instructions from the till</p>
        </>
    )
}