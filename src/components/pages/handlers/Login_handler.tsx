import {referenceObj, username} from "../../shared/Shared_objs.tsx";
import {ScreenState} from "../../shared/Screen_state.tsx";

export function LoginScreenHandler(socket: WebSocket, response: string, screen: referenceObj, nonce: referenceObj){
    // message handler for login screen
    if(response == "FAIL"){ // backend sends this back if either/both username and password is wrong
        alert("Incorrect username or password")
        return ""
    } else if(response == "OK"){ // if backsend sends this back that means the login was accepted
        socket.send(nonce.value + "1NEXT3" + (document.getElementById("username_input") as HTMLInputElement).value) // this tells the backend we are moving onto the store locator
        return ""
    } else if(response.slice(0, 5) == "GUEST") {
        username.value = response.slice(5, 20)
        console.debug("guest username received: " + username.value)
        socket.send(nonce.value + "1NEXT3" + username.value)
        return ""
    } else if(response.slice(0, 4) == "NEXT"){
        if(response.slice(4, 5) == "2"){
            screen.value = ScreenState.SignUp
            console.debug("move to account creation")
            return "2"
        } else if(response.slice(4, 5) == "3"){
            screen.value = ScreenState.StoreLocator
            console.debug("move to store locator")
            return "3"
        }
    }
}