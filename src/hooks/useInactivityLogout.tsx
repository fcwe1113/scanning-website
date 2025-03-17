import {useNavigate} from "react-router-dom";
import {useEffect, useRef} from "react";

export const InactivityLogout = () => {
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set timer to log out user after 5 minutes (300000 milliseconds) of inactivity
        timerRef.current = setTimeout(() => {
            console.log("User inactive for 5 minutes. Redirecting to login.");
            // navigate("/login"); // Redirect to login after inactivity
        }, 300000);
    };

    const resetTimer = () => {
        console.log("User activity detected. Resetting timer.");
        startTimer();
    };

    useEffect(() => {
        // Adding event listeners to reset timer
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keypress", resetTimer);
        window.addEventListener("click", resetTimer);

        startTimer(); // Login the inactivity timer when the component mounts

        return () => {
            // Cleanup function to clear timer and remove event listeners
            clearTimeout(timerRef.current!);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keypress", resetTimer);
            window.removeEventListener("click", resetTimer);
        };
    }, [navigate]);

    return null; // This component does not render anything
};