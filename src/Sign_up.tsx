import React, { useRef, useState } from "react";
import { nonce, referenceObj, socket, username } from "./App";
import { ScreenState } from "./Screen_state";
// import { login } from "../services/UserApi";

const SignUp: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
        <h1>Super Scanner</h1>
        <input type="text" id="username_input" placeholder='username'></input>
        <input type="password" id="password_input" placeholder='password'></input><br />
        <input type="password" id="password_confirm" placeholder='confirm password'></input><br />
        <input type="text" id="first_name_input" placeholder='first name'></input><br />
        <input type="text" id="last_name_input" placeholder='last name'></input><br />
        <input type="text" id="dob_input" placeholder='dob'></input><br />
        <input type="text" id="email_input" placeholder='email'></input><br />
        <input type="text" id="email_confirm" placeholder='confirm email'></input><br />
        {/* <div id="button_div"> */}
            <button onClick={() => SignUpForm()}>Sign up</button><br />
            <button>Cancel</button><br />
        {/* </div> */}
        </>
    );
};

function SignUpForm(){
    const usernamee = document.getElementById("username_input").value
    const password = document.getElementById("password_input").value

    
}

export function sign_up_screen(socket: WebSocket, response: String, screen: referenceObj, nonce: referenceObj){
    // message handler for sign up screen
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

export default SignUp;