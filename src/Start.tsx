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

    return (
        <><h1>Welcome to the Scanning app</h1><input placeholder='username'></input><input placeholder='password'></input><div>
            <button>Sign in</button><br />
            <button>Sign up</button><br />
            <button>Proceed as guest</button>
        </div></>
    );
};

export default Start;