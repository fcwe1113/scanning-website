import {globalSetEmailVerify, referenceObj, username} from "../../shared/Shared_objs.tsx";
import {ScreenState} from "../../shared/Screen_state.tsx";
import React from "react";

export const SignUpHandler = (socket: WebSocket, response: string, screen: referenceObj, nonce: referenceObj) => {
    // message handler for sign up screen
    if(response == "BADNAME"){ // backend sends this back if either/both username and password is wrong
        alert("username in use")
        return ""
    } else if (response.slice(0, 7) == "BADFORM") {
        alert(response.replace("BADFORM ", ""))
        return ""
    } else if (response == "NAMEOK") {
        // email_verify = true // try and make this flag work
        const setEmailVerify = globalSetEmailVerify.value as React.Dispatch<React.SetStateAction<boolean>>
        setEmailVerify(true)

    } else if(response == "OK"){ // if backsend sends this back that means the login was accepted
        socket.send(nonce.value + "2NEXT3" + username.value) // this tells the backend we are moving onto the store locator
        return ""
    } else if(response.slice(0, 4) == "NEXT"){
        if(response.slice(4, 5) == "1"){
            screen.value = ScreenState.Start
            console.debug("move to login")
            return "1"
        } else if(response.slice(4, 5) == "3"){
            screen.value = ScreenState.StoreLocator // 2i.
            console.debug("move to store locator")
            return "3"
        }
    }
}