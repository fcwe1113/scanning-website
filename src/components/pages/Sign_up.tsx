import React, { useEffect, useState } from "react";
import {globalSetEmailVerify, socket, username} from "../shared/Shared_objs.tsx";
import {nonce} from "../shared/Shared_objs.tsx";
// import { login } from "../services/UserApi";

    // 2 = sign up screen
        // a. check items: token
        // b. do regular status checks until user either clicks sign up or cancel***
        // c. user enters all relevant info and client sanitises input***
        // d. client then sends the JSON form to backend***
        // with the format "2CHECK[JSON of the entire sign up form]"
        // e. server does another sanitize check
            // I. if there are errors then the list of error messages would be sent down prepended with "2BADFORM"
        // f. server run the username with db and a list of usernames being signed up
            // I. if no clashes from both, send "2NAMEOK" and put the name in the list
            // server should also send the verification email with the generated token (that is going to be ABCDEF) but nahhhhhhhhhhh
            // II. if a clash is found send "2BADNAME" and restart the process
        // g. client then does the email verification* and send back "2EMAILverify_token"***
            // i have a feeling that the token would be ABCDEF but idk
            // I. if the token is incorrect send "2BADEMAIL"
        // h. server runs the sql command to insert a new row containing all the given information, and send "2OK" after its done
        // i. move on to the store locator

const SignUp: React.FC = () => {
    const [EmailVerify, setEmailVerify] = useState(false)
    useEffect(() => {
        setEmailVerify(EmailVerify)
    }, [EmailVerify])
    globalSetEmailVerify.value = setEmailVerify // pass the function out into global

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return !EmailVerify ? (
        <>
        <h1>Sign Up</h1>
        <input type="text" id="username_input" placeholder='username'></input> {/* must be unique and without spaces, check with db to check clashes */}
        <input type="password" id="password_input" placeholder='password'></input><br /> {/* minimum 8 long, must include both cap non cap and numbers */}
        <input type="password" id="password_confirm" placeholder='confirm password'></input><br />
        <input type="text" id="first_name_input" placeholder='first name'></input><br />
        <input type="text" id="last_name_input" placeholder='last name'></input><br />
        <input type="text" id="dob_input" placeholder='dob: YYYY-MM-DD'></input><br /> {/* in yyyy-mm-dd bc of rusqlite */}
        <input type="text" id="email_input" placeholder='email'></input><br /> {/* must contain @, will receive a "registration email" with a code to check validity */}
        <input type="text" id="email_confirm" placeholder='confirm email'></input><br />
        {/* <div id="button_div"> */}
        <button onClick={() => SignUpForm()}>Sign up</button><br />
        <button onClick={() => Cancel()}>Cancel</button><br />
        {/* </div> */}
        </>
    ) : (
        <>
        <h2>Please verify your email by typing in the verification codes sent to your email</h2>
        <h2>Oh no I spilled the code its ABCDEF what am I gonna doooooooo</h2>
        <input type="text" id="code_input" placeholder='verification code'></input><br/>
        {/* 2g. below */}
        <button onClick={() => socket.send(nonce.value + "2EMAIL" + (document.getElementById("code_input") as HTMLInputElement).value)}>Verify</button>

        </>
    )
}

function SignUpForm(){

    const username_input = (document.getElementById("username_input") as HTMLInputElement).value
    const password_input = (document.getElementById("password_input") as HTMLInputElement).value
    const dob_input = (document.getElementById("dob_input") as HTMLInputElement).value
    const email_input = (document.getElementById("email_input") as HTMLInputElement).value
    
    if (Sanitise(username_input, password_input, dob_input, email_input)){ // 2c.
        return
    }

    const jsonPayload = {
        username: username_input,
        password: password_input,
        first_name: (document.getElementById("first_name_input") as HTMLInputElement).value,
        last_name: (document.getElementById("last_name_input") as HTMLInputElement).value,
        dob: dob_input,
        email: email_input,
    }
    console.debug(JSON.stringify(jsonPayload))

    socket.send(nonce.value + "2CHECK" + JSON.stringify(jsonPayload)) // 2d.
    console.debug("sent sign up JSON")
    username.value = username_input
    
}

function Sanitise(username_input: string, password_input: string, dob_input: string, email_input: string){
    // check if empty
    if (username_input == ""){
        alert("please enter your username")
        return true
    }
    if (password_input == ""){
        alert("please enter your password")
        return true
    }
    if ((document.getElementById("first_name_input") as HTMLInputElement).value == ""){
        alert("please enter your first name")
        return true
    }
    if ((document.getElementById("last_name_input") as HTMLInputElement).value == ""){
        alert("please enter your last name")
        return true
    }
    if (dob_input == ""){
        alert("please enter your date of birth")
        return true
    }
    if (email_input == ""){
        alert("please enter your email")
        return true
    }

    // username checks (no spaces)
    if (username_input.includes(" ")){
        alert("usernames cannot have spaces")
        return true
    }

    // password checks (need lower case upper case and number, at least 8 long, and same as password confirm box)
    if (password_input.length < 8){
        alert("passwords must be at least 8 long")
        return true
    }
    if (!(new RegExp('^.*[a-z].*$').test(password_input))){
        alert("passwords need to have lower case characters")
        return true
    }
    if (!(new RegExp('^.*[A-Z].*$').test(password_input))){
        alert("passwords need to have upper case characters")
        return true
    }
    if (!(new RegExp('^.*\\d.*$').test(password_input))){
        alert("passwords need to have numbers")
        return true
    }
    if ((document.getElementById("password_confirm") as HTMLInputElement).value != password_input){
        alert("password confirm incorrect")
        return true
    }

    // dob check (format being YYYY-MM-DD)
    if (!(new RegExp('^\\d{4}-\\d{2}-\\d{2}$').test(dob_input))){
        alert("dates should have the format of YYYY-MM-DD")
        return true
    }

    // email check (must be something@something.something, and same as value in email confirm box)
    if (!(new RegExp('^[\\w!#$%&\'*+-/=?^_`{|}~]+@\\w+.\\w+$').test(email_input))){
        alert("email invalid")
        return true
    }
    if ((document.getElementById("email_confirm") as HTMLInputElement).value != email_input){
        alert("email confirm incorrect")
        return true
    }
    return false
}

function Cancel(){
    socket.send(nonce.value + "2NEXT1")
}

export default SignUp;