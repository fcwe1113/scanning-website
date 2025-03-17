import {referenceObj} from "../shared/Shared_objs.tsx";
import {ScreenState} from "../shared/Screen_state.tsx";

export const token_exchange = async (
    socket: WebSocket,
    response: string,
    screen: referenceObj,
    token: referenceObj,
    nonce: referenceObj,
): Promise<boolean> => {

    // messages sent from both ends should follow a similar format (at least for the first few chars)
    // *** denotes client side tasks
    // 0 = token exchange
        // a. when the websocket channel opens the server will upgrade the connection to a TLS connection (or not if local)
        // b. server will generate a token and send it to the client, the client would have a placeholder token which prevent the client from proceeding
        // c. the client saves the token and pings back the same token to the server***
        // d. the server sends an ack back if the token matches and switches the token_exchanged flag on and saves it in the list(tm)
        // e. client then tells the server to move on to the start screen state***
        // f. server tells client to move on then moves on itself, unless the token_exchanged flag is not on, in which case handle the error
        // g. client moves on for real***
        // while the client is waiting for the token exchange ack it can show a loading wheel or something idk

    if (response == "NEXT") {
        // console.log("b4: " + screen)
        screen.value = ScreenState.Login // 0i moving on
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