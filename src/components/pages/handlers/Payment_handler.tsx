import {setPaymentSuccess, toastPaymentError} from "../../shared/Shared_objs.tsx";

export function PaymentHandler (response: string){
    console.debug("PaymentHandler response: ", response)
    if (response == "SUCCESS") {
        (setPaymentSuccess.value as React.Dispatch<React.SetStateAction<boolean>>)(true)
    } else if (response == "FAIL") {
        (toastPaymentError.value as (response: string) => void)("Payment failed, please try again");
    }
}