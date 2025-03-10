import React from "react";
import { nonce, referenceObj, socket } from "./App";
import { ScreenState } from "./Screen_state";
// import { login } from "../services/UserApi";

    // 2 = sign up screen
        // a. check items: token
        // b. do regular status checks until user either clicks log in sign up or proceed as guest***
        // c. if user enters all relevant info and client sanitises input***
        // d. client then sends username to backend to check for clashes***
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

let email_verify: boolean = false
let username: string = ""

const SignUp: React.FC = () => {

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <EmailCheck email_verify={email_verify}/>
    );
};

function EmailCheck({email_verify} : any){
    return !email_verify ? (
        <>
        
        <h1>Sign Up</h1>
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
    ) : (
        <>
        <h2>Please verify your email by typing in the verification codes sent to your email</h2>
        <h2>Oh no I spilled the code its ABCDEF what am I gonna doooooooo</h2>
        <input type="text" id="code_input" placeholder='verification code'></input><br/>
        <button onClick={() => Verify()}>Verify</button>

        </>
    )
    
}

function Verify(){
    socket.send("2EMAIL" + (document.getElementById("code_input") as HTMLInputElement).value)
}

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

    socket.send(nonce.value + "2CHECK" + JSON.stringify(jsonpayload))
    console.debug("sent sign up JSON")
    username = username_input
    
}

function Cancel(){
    socket.send(nonce.value + "2NEXT1")
}

export function sign_up_screen(socket: WebSocket, response: String, screen: referenceObj, nonce: referenceObj){
    // message handler for sign up screen
    if(response == "BADNAME"){ // backend sends this back if either/both username and password is wrong
        alert("username in use") // todo
        return ""
    } else if (response.slice(0, 7) == "BADFORM") {
        alert(response.replace("BADFORM ", ""))
        return ""
    } else if (response == "NAMEOK") {
        email_verify = true // try and make this flag work

    } else if(response == "OK"){ // if backsend sends this back that means the login was accepted
        socket.send(nonce.value + "2NEXT3" + username) // this tells the backend we are moving onto the store locator
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