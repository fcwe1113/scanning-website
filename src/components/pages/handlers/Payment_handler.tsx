import {setPaymentSuccess, setPaymentTransfer, toastPaymentError} from "../../shared/Shared_objs.tsx";
import React from "react";

export function PaymentHandler (response: string){
    // console.debug("PaymentHandler response: ", response)
    if (response == "SUCCESS") {
        (setPaymentSuccess.value as React.Dispatch<React.SetStateAction<boolean>>)(true)
    } else if (response == "FAIL") {
        (toastPaymentError.value as (response: string) => void)("Payment failed, please try again");
    } else if (response == "INVALID") {
        (toastPaymentError.value as (response: string) => void)("Invalid code scanned");
    } else if (response == "OK") {
        (setPaymentSuccess.value as React.Dispatch<React.SetStateAction<boolean>>)(true);
        (setPaymentTransfer.value as React.Dispatch<React.SetStateAction<boolean>>)(true)
    } else if (response.slice(0, 4) == "CARD") {
        const json = response.replace("CARD", "");
        (document.getElementById("cardNumber") as HTMLInputElement).value = JSON.parse(json)["number"];
        (document.getElementById("expiryDate") as HTMLInputElement).value = JSON.parse(json)["expiry"];
        (document.getElementById("cvv") as HTMLInputElement).value = JSON.parse(json)["cvv"]
    }
}