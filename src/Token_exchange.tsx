import { referenceObj } from "./App"
import { ScreenState } from "./Screen_state"

// messages sent from both ends should follow a similar format (at least for the first few chars)
// *** denotes client side tasks
// 0 = token exchange
// a. when the websocket channel opens the server will generate the token and send it to the client, the client would have a placeholder token which prevent the client from proceeding
// b. the client saves the token and pings back the same token to the server***
// c. the server sends an ack back if the token matches and switches the token_exchanged flag on and saves it in the list(tm)
// d. client then tells the server to move on to the start screen state***
// e. server tells client to move on then moves on itself, unless the token_exchanged flag is not on, in which case handle the error
// f. client moves on for real***
// while the client is waiting for the token exchange ack it can show a loading wheel or something idk

// as all parameters passed in are objects (yes they are trust me) they are all passed by reference
export function token_exchange(socket: WebSocket, response: String, screen: referenceObj, token: String) : boolean {
    if (response == "ACK") {
        socket.send("0NEXT") // 0d request next screen
        console.info("sent \"0NEXT\"")
        return false
    } else if (response == "NEXT") {
        // console.log("b4: " + screen)
        screen.value = ScreenState.Start // 0f moving on
        // console.log("after: " + screen)
        // console.log("yes it worked")
        return true
    } else if (response.length == 10) {
        token = response // 0b save token
        // console.log(token)
        socket.send("0" + token) // 0b send it back
        console.info("sent \"0" + token + "\"")
        return false
    } else { // this will only happen if i fked up the backend
        console.log(response)
        console.error("wtf did i just receive")
        return false
    }
}