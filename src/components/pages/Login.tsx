import React from "react";
import {socket} from "../shared/Shared_objs.tsx";
import {nonce, username} from "../shared/Shared_objs.tsx";
import "../../main.css"

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

const Login: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
            <h1>Super Scanner</h1><br/>
            <input type="text" id="username_input" placeholder='username'></input>
            <input type="password" id="password_input" placeholder='password'></input><br />
            {/* <div id="button_div"> */}
            <button onClick={() => LoginFunction()}>Sign in</button><br />
            <button onClick={() => socket.send(nonce.value + "1NEXT2")}>Sign up</button><br />
            <button onClick={() => socket.send(nonce.value + "1GUEST")}>Proceed as guest</button>
        {/* </div> */}
        </>
    );
};

function LoginFunction(){

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

export default Login;