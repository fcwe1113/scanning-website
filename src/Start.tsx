import React from "react";
import { nonce, referenceObj, socket, username } from "./App";
import { ScreenState } from "./Screen_state";
// import { login } from "../services/UserApi";

const Start: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
        <h1>Super Scanner</h1>
        <input type="text" id="username_input" placeholder='username'></input>
        <input type="password" id="password_input" placeholder='password'></input><br />
        {/* <div id="button_div"> */}
            <button onClick={() => Login()}>Sign in</button><br />
            <button onClick={() => SignUp()}>Sign up</button><br />
            <button>Proceed as guest</button>
        {/* </div> */}
        </>
    );
};

function Login(){

    const usernamee = (document.getElementById("username_input") as HTMLInputElement).value
    const password = (document.getElementById("password_input") as HTMLInputElement).value

    // do some input sanitising before passing along the inputs
    // add more here later if needed
    if(usernamee.length > 0){
        if(password.length > 0){
            socket.send(nonce.value + "1LOGIN" + usernamee + " " + password)
            console.debug("sent: " + nonce.value + "1LOGIN" + usernamee + " " + password)
            username.value = usernamee
        } else {
            alert("please type in a password")
        }    
    } else {
        alert("please type in a username")
    }
}

export function login_screen(socket: WebSocket, response: String, screen: referenceObj, nonce: referenceObj){
    // message handler for login screen
    if(response == "FAIL"){ // backend sends this back if either/both username and password is wrong
        alert("Incorrect username or password")
        return ""
    } else if(response == "OK"){ // if backsend sends this back that means the login was accepted
        socket.send(nonce.value + "1NEXT3") // this tells the backend we are moving onto the store locator
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

function SignUp(){
    socket.send(nonce.value + "1NEXT2")
}

export default Start;