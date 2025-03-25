import {referenceObj} from "../../shared/Shared_objs.tsx";
import {ScreenState} from "../../shared/Screen_state.tsx";

export const TokenExchangeHandler = async (
    socket: WebSocket,
    response: string,
    screen: referenceObj,
    token: referenceObj,
    nonce: referenceObj,
): Promise<boolean> => {
    /*} else*/ if (response == "NEXT") {
        // console.log("b4: " + screen)
        screen.value = ScreenState.Start // 0i moving on
        // console.log("after: " + screen)
        // console.log("yes it worked")
        return true
    } else if (response.length == 10) { // tokens are 10 length
        token.value = response // 0e save token
        // console.log(token)
        socket.send("0" + token.value) // 0e send it back
        console.debug("sent \"0" + token.value + "\"")
        return false
    } else if (response.length == 20) { // nonces are 20 length
        nonce.value = response
        socket.send(nonce.value + "0NEXT") // 0g request next screen
        console.debug("sent \"" + nonce.value + "0NEXT\"")
        return false
    } else { // this will only happen if i fked up the backend
        console.log(response)
        console.error("wtf did i just receive")
        return false
    }
};