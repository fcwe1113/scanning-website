import {nonce, screenStateObj, setGlobalScreenState, socket, token} from "../components/shared/Shared_objs.tsx";
import {token_exchange} from "../components/Token_exchange/Token_exchange_message_handler.tsx";
import {ScreenState} from "../components/shared/Screen_state.tsx";
import {login_screen} from "../components/Login/Login_message_handler.tsx";
import {sign_up_screen} from "../components/Sign_up/Sign_up_message_handler.tsx";
import {store_locator_screen} from "../components/Locate_store/Locate_store_message_handler.tsx";

const deployed = false
export const BackendLink = deployed ? "wss://efrgtghyujhygrewds.ip-ddns.com:8080/" : "ws://localhost:8080/"

export default function BackendTalk(result: string): ScreenState | null {

    // message deciphering

    // first digit denotes client screen status
    // after reading the first digit get rid of it and pass the rest of the message into the relevant function
    // messages sent from both ends should follow a similar format (at least for the first few chars)
    // 0 = token exchange
    // 1 = start screen
    // 2 = sign up screen
    // 3 = store locator
    // 4 = main app (the scanning screen)
    // 5 = payment screen
    // 6 = transferring to till (either by choice or to check id)
    // 7 = after payment/logging out

    // let result: string = getGlobalResponse()
    if (result === "") {
        return null
    }
    const oprand = result.slice(0, 1)
    result = result.replace(oprand, "")
    switch (oprand) {
        case "S":
            if (result.slice(0, 5) == "TATUS") {
                nonce.value = result.replace("TATUS", "")
                console.debug("new nonce rceived: " + nonce.value)
            }
            break

        case "0": {
            const token_exchange_async = async () => {
                if (await token_exchange(socket, result, screenStateObj, token, nonce)) {
                    // screenStateObj.value = ScreenState.Login
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.Login)
                }
            }

            token_exchange_async().then(() => {})
            break
        }
        case "1":

            switch (login_screen(socket, result, screenStateObj, nonce)) {
                case "2":
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.SignUp)
                    break
                case "3":
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.StoreLocator)
                    socket.send(nonce.value + "3LIST")
                    break
            }
            break
        case "2":
            switch (sign_up_screen(socket, result, screenStateObj, nonce)) {
                case "1":
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.Login)
                    break
                case "3":
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.StoreLocator)
                    socket.send(nonce.value + "3LIST") // 3c.
                    break
            }
            break

        case "3":
            switch (store_locator_screen(socket, result, nonce)) {
                case "4":
                    (setGlobalScreenState.value as React.Dispatch<React.SetStateAction<ScreenState>>)(ScreenState.MainScanner)
                    break
            }
            break
    }
    return null
}