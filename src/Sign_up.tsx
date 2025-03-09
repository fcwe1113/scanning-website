import React from "react";
import { nonce, referenceObj, socket } from "./App";
import { ScreenState } from "./Screen_state";
// import { login } from "../services/UserApi";

const SignUp: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
        <h1>Super Scanner</h1>
        <input type="text" id="username_input" placeholder='username'></input> {/* must be unique and without spaces, check with db to check clashes */}
        <input type="password" id="password_input" placeholder='password'></input><br /> {/* minimum 8 long, must include both cap non cap and numbers */}
        <input type="password" id="password_confirm" placeholder='confirm password'></input><br />
        <input type="text" id="first_name_input" placeholder='first name'></input><br />
        <input type="text" id="last_name_input" placeholder='last name'></input><br />
        <input type="text" id="dob_input" placeholder='dob'></input><br /> {/* in yyyy-mm-dd bc of rusqlite */}
        <input type="text" id="email_input" placeholder='email'></input><br /> {/* must contain @, will receive a "registration email" with a code to check validity */}
        <input type="text" id="email_confirm" placeholder='confirm email'></input><br />
        {/* <div id="button_div"> */}
            <button onClick={() => SignUpForm()}>Sign up</button><br />
            <button onClick={() => Cancel()}>Cancel</button><br />
        {/* </div> */}
        </>
    );
};

function SignUpForm(){

    const username_input = (document.getElementById("username_input") as HTMLInputElement).value
    const password_input = (document.getElementById("password_input") as HTMLInputElement).value
    const dob_input = (document.getElementById("dob_input") as HTMLInputElement).value
    const email_input = (document.getElementById("email_input") as HTMLInputElement).value
    
    // check if empty
    if (username_input == ""){
        alert("please enter your username")
        return
    }
    if (password_input == ""){
        alert("please enter your password")
        return
    }
    if ((document.getElementById("first_name_input") as HTMLInputElement).value == ""){
        alert("please enter your first name")
        return
    }
    if ((document.getElementById("last_name_input") as HTMLInputElement).value == ""){
        alert("please enter your last name")
        return
    }
    if (dob_input == ""){
        alert("please enter your date of birth")
        return
    }
    if (email_input == ""){
        alert("please enter your email")
        return
    }

    // username checks (no spaces)
    if (username_input.includes(" ")){
        alert("usernames cannot have spaces")
        return
    }

    // password checks (need lower case upper case and number, at least 8 long, and same as password confirm box)
    if (password_input.length < 8){
        alert("passwords must be at least 8 long")
        return
    }
    if (!(new RegExp('^.*[a-z].*$').test(password_input))){
        alert("passwords need to have lower case characters")
        return
    }
    if (!(new RegExp('^.*[A-Z].*$').test(password_input))){
        alert("passwords need to have upper case characters")
        return
    }
    if (!(new RegExp('^.*\\d.*$').test(password_input))){
        alert("passwords need to have numbers")
        return
    }
    if ((document.getElementById("password_confirm") as HTMLInputElement).value != password_input){
        alert("password confirm incorrect")
        return
    }

    // dob check (format being YYYY-MM-DD)
    if (!(new RegExp('^\\d{4}[-]\\d{2}[-]\\d{2}$').test(dob_input))){
        alert("dates should have the format of YYYY-MM-DD")
        return
    }

    // email check (must be something@something.something, and same as value in email confirm box)
    if (!(new RegExp('^[\\w!#$%&\'*+-/=?^_`{|}~]+[@][\\w]+[\.][\\w]+$').test(email_input))){
        alert("email invalid")
        return
    }
    if ((document.getElementById("email_confirm") as HTMLInputElement).value != email_input){
        alert("email confirm incorrect")
        return
    }

    let jsonpayload = {
        username: username_input,
        password: password_input,
        first_name: (document.getElementById("first_name_input") as HTMLInputElement).value,
        last_name: (document.getElementById("last_name_input") as HTMLInputElement).value,
        dob: dob_input,
        email: email_input,
    }

    socket.send(nonce.value + "2CHECK " + JSON.stringify(jsonpayload))
    console.debug("sent sign up JSON")
    
}

function Cancel(){
    socket.send(nonce.value + "2NEXT1")
}

export function sign_up_screen(socket: WebSocket, response: String, screen: referenceObj, nonce: referenceObj){
    // message handler for sign up screen
    if(response == "BADNAME"){ // backend sends this back if either/both username and password is wrong
        alert("username in use") // todo
        return ""
    } else if (response == "NAMEOK") {
        // do stuff if name is usable
    } else if(response == "OK"){ // if backsend sends this back that means the login was accepted
        socket.send(nonce.value + "2NEXT3") // this tells the backend we are moving onto the store locator
        return ""
    } else if(response.slice(0, 4) == "NEXT"){
        if(response.slice(4, 5) == "1"){
            screen.value = ScreenState.Start
            console.debug("move to login")
            return "1"
        } else if(response.slice(4, 5) == "3"){
            screen.value = ScreenState.StoreLocator
            console.debug("move to store locator")
            return "3"
        }
    }
}

export default SignUp;