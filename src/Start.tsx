import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nonce, socket } from "./App";
// import { login } from "../services/UserApi";

const Start: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setError(null);
    //     setLoading(true);

    //     try {
    //         const userData = { username, password };
    //         //   await login(userData);
    //         navigate("/dashboard");
    //     } catch (error: any) {
    //         setError(error.message || "Invalid credentials");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // note that this page is just functional, and deffo not good looking yet, but ill fix that later bc css ptsd is a real issue and more ppl should talk abt it
    return (
        <>
        <h1>Super Scanner</h1>
        <input type="text" id="username_input" placeholder='username'></input>
        <input type="password" id="password_input" placeholder='password'></input><br />
        {/* <div id="button_div"> */}
            <button onClick={() => Login()}>Sign in</button><br />
            <button>Sign up</button><br />
            <button>Proceed as guest</button>
        {/* </div> */}
        </>
    );
};

function Login(){
    const username = document.getElementById("username_input").value
    const password = document.getElementById("password_input").value

    // do some input sanitising before passing along the inputs
    // add more here later if needed
    if(username.length > 0){
        if(password.length > 0){
            socket.send(nonce.value + "1LOGIN" + username + " " + password)
            console.debug("sent: " + nonce.value + "1LOGIN" + username + " " + password)
        } else {
            alert("please type in a password")
        }    
    } else {
        alert("please type in a username")
    }
}

export default Start;