import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <input type="text" id="password_input" placeholder='password'></input><br />
        {/* <div id="button_div"> */}
            <button>Sign in</button><br />
            <button>Sign up</button><br />
            <button>Proceed as guest</button>
        {/* </div> */}
        </>
    );
};

export default Start;