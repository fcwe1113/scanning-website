import React from "react";
import { ScreenState } from "./Screen_state";
import {socket} from "./App.tsx";
import {nonce, referenceObj, username} from "./Reference_objects.tsx";
// import { login } from "../services/UserApi";

// 1 = start screen
        // a. check items: token
        // b. do regular status checks until user either clicks log in sign up or proceed as guest***
        // c. if user logs in client sends username and password in textbox***
        // with the format "1username password"
            // I. server querys db to get password of username
            // II. server saves username locally and pings down OK if correct
            // if db returns incorrect or empty pings down FAIL and returns to step 1b.
            // III. client saves the username locally and pings "1NEXT3" to server***, server go to step 1f.
        // d. if user clicks sign up client pings "1NEXT2"***, server go to step 1f.
        // e. if user clicks proceed as guest client pings "1guest 00000000" to server***
            // I. server saves the username locally and pings "1ACK" to client
            // II. client saves username locally and pings "1NEXT 3 token"***, server go to step 1f.
        // f. server decipher the message, checks the token to be correct,
        // and extract the destination screen status contained in it
        // g. server pings "1NEXT *2/3*" depending on which one the client sent before
        // and server moves on to that state
        // h. client receives message and also moves on to the next state

const Start: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
            <h1>Super Scanner</h1><br/>
            <input type="text" id="username_input" placeholder='username'></input>
            <input type="password" id="password_input" placeholder='password'></input><br />
            {/* <div id="button_div"> */}
            <button onClick={() => Login()}>Sign in</button><br />
            <button onClick={() => SignUp()}>Sign up</button><br />
            <button onClick={() => socket.send(nonce.value + "1GUEST")}>Proceed as guest</button>
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

export function login_screen(socket: WebSocket, response: string, screen: referenceObj, nonce: referenceObj){
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

function SignUp(){
    socket.send(nonce.value + "1NEXT2")
}

export default Start;