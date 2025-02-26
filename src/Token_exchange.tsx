import { Navigate, NavigateFunction, useNavigate } from "react-router-dom"
import { changeScreen, referenceObj } from "./App"
import { ScreenState } from "./Screen_state"
import CircularIndeterminate from "./Loading_screen"

// messages sent from both ends should follow a similar format (at least for the first few chars)
// *** denotes client side tasks
// 0 = token exchange
// a. when the websocket channel opens the server will generate the key pair and send the public key to the client,
// b. the client receives the public key then generates its own key pair, if the client isnt ready ping over WAIT instead***
// c. client sends the public key over and encrypting it with the server's public key***
// EVERYTHING PAST THIS POINT WILL BE DONE WITH ENCRYPTION
// d. server will generate a token and send it to the client, the client would have a placeholder token which prevent the client from proceeding
// e. the client saves the token and pings back the same token to the server***
// f. the server sends an ack back if the token matches and switches the token_exchanged flag on and saves it in the list(tm)
// g. client then tells the server to move on to the start screen state***
// h. server tells client to move on then moves on itself, unless the token_exchanged flag is not on, in which case handle the error
// i. client moves on for real***
// while the client is waiting for the token exchange ack it can show a loading wheel or something idk


let keySent = false

// as all parameters passed in are objects (except public_key) they are all passed by reference
export async function token_exchange(
    socket: WebSocket,
    response: String,
    screen: referenceObj,
    token: referenceObj,
    nonce: referenceObj,
): Promise<boolean>{
    
    // if (!keySent) {

    //     if (!server_public_key.value && keyReceived.value) {
    //         // socket.send(String("0ACK")) // 0a. ACK
    //         keyReceived.value = false

    //         function str2ab(str:string) {
    //             const buf = new ArrayBuffer(str.length);
    //             const bufView = new Uint8Array(buf);
    //             for (let i = 0, strLen = str.length; i < strLen; i++) {
    //                 bufView[i] = str.charCodeAt(i);
    //             }
    //             return buf;
    //         }

    //         const pemHeader = "-----BEGIN PUBLIC KEY-----";
    //         const pemFooter = "-----END PUBLIC KEY-----";
    //         const pemContents = response.substring(
    //             pemHeader.length,
    //             response.length - pemFooter.length - 1,
    //         );
    //         // base64 decode the string to get the binary data
    //         const binaryDerString = window.atob(pemContents);
    //         // convert from a binary string to an ArrayBuffer
    //         const binaryDer = str2ab(binaryDerString);
    //         server_public_key.value = await window.crypto.subtle.importKey("spki", binaryDer,
    //             {
    //               name: "RSA-OAEP",
    //               hash: "SHA-256",
    //             },
    //             true,
    //             ["encrypt"],
    //         );
    //         keyReceived.value = true
    //         console.log("key stored")

    //         await sendEncrypted("0ACK")

    //     }

    //     if (keyRdy.value) {
    //         // socket.send(public_key)
    //         keySent = true
    //     } else {
    //         // socket.send("WAIT")
    //     }
    //     return false

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
}

export const Loading: React.FC = () => {
    return (CircularIndeterminate())
}

// export Loading