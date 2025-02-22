import { useState, useEffect, useRef, Component } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import KeyObject from 'node:crypto'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CircularIndeterminate from './Loading_screen';
import { ScreenState } from './Screen_state';
import { token_exchange, Loading } from './Token_exchange';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Start from './Start'

export class referenceObj {
  value: any = ScreenState.Loading;

  constructor(value: any) {
    this.value = value
  }
}

const StartScreen = (
  <><h1>Welcome to the Scanning app</h1><input placeholder='username'></input><input placeholder='password'></input><div>
    <button>Sign in</button><br />
    <button>Sign up</button><br />
    <button>Proceed as guest</button>
  </div></>
)

let changeScreeeen: referenceObj = new referenceObj(false)
let screen: referenceObj = new referenceObj(ScreenState.Loading)
// let page: referenceObj = new referenceObj(CircularIndeterminate())
let token = new referenceObj(new String("-1"))
let nonce = new referenceObj(new String("-1"))
let lastChecked = new Date()

// this block will block the rest of the code from running before it is done
// i dont know how to async it yet so yea change it when i know how pls
// let keypair = forge.pki.rsa.generateKeyPair({bits: 2048})
// let private_key: String | CryptoKey
// let public_key: string
// let key
// let server_public_key: referenceObj = new referenceObj("")
// let keyRdy: referenceObj = new referenceObj(false)
// let keyReceived: referenceObj = new referenceObj(true)
var socket: WebSocket

function App() {

  // for the camera lib use the one demoed in kybarg.github.io/react-qr-scanner/

  console.log(lastChecked)
  return (
    <>
    <Router>
      <InactivityLogout />
      <BackendTalk /> {/* this means run whatever function name we put in < /> as a hook(special type of async function idk) */}
      <StatusCheck />
      {/* <Navbar /> */}
      <Routes>
        <Route path="/scanning-website" element={<Loading />} />
        {/* <Route path="/search" element={<Search />} />
        <Route path="/signup" element={<SignUp />} /> */}
        <Route path="/scanning-website/login" element={<Start />} />
        {/* <Route path="/profile/:userId" element={<Profile />} /> */}
        <Route
        // path="/dashboard"
        // element={
        //   <PrivateRoute>
        //     <Dashboard />
        //   </PrivateRoute>
        // }
        />
      </Routes>
    </Router>
    </>
  )

}

const BackendTalk = () => {
  const navigator = useNavigate()

  useEffect(() => {

    socket = new WebSocket("ws://localhost:8080/")
    socket.onopen = () => console.debug("websocket connected")

    // Listen for messages
    socket.onmessage = async (evt) => {
      console.debug("received \"" + evt.data + "\"")

      // first digit denotes client screen status
      // after reading the first digit get rid of it and pass the rest of the message into the relevant function
      // messages sent from both ends should follow a similar format (at least for the first few chars)
      // *** denotes client side tasks
      // 0 = token exchange
      // 1 = start screen
        // a. check items: token
        // b. do regular status checks until user either clicks log in sign up or proceed as guest***
        // c. if user logs in client sends username and password in textbox***
          // with the format "1username password"
          // I. server querys db to get password of username
          // II. server saves username locally and pings down OK if correct
          // if db returns incorrect or empty pings down BADINFO and returns to step 1b.
          // III. client saves the username locally and pings "1NEXT 3 token" to server***, server go to step 1f.
        // d. if user clicks sign up client pings "1NEXT 2 token"***, server go to step 1f.
        // e. if user clicks proceed as guest client pings "1guest 00000000" to server***
          // I. server saves the username locally and pings "1ACK" to client
          // II. client saves username locally and pings "1NEXT 3 token"***, server go to step 1f.
        // f. server decipher the message, checks the token to be correct,
        // and extract the destination screen status contained in it
        // g. server pings "1NEXT *2/3*" depending on which one the client sent before
        // and server moves on to that state
        // h. client receives message and also moves on to the next state
      // 2 = sign up screen
      // 3 = store locator
      // 4 = main app (the scanning screen)
      // 5 = payment screen
      // 6 = transferring to till (either by choice or to check id)
      // 7 = after payment/logging out

      let response = evt.data

      let oprand = response.slice(0, 1)
      response = response.replace(oprand, "")
      switch (oprand) {
        case "0":
          
          if (await token_exchange(socket, response, screen, token, nonce, navigator)){
            navigator("/scanning-website/login")
          }
          console.debug("screen state: " + screen.value)
        case "S":
          if (response.slice(0,5) == "TATUS"){
            nonce.value = response.replace("TATUS", "")
            console.debug("new nonce rceived: " + nonce.value)
          }
      }

      // if (screen.value == ScreenState.Loading) {
      //   page.value = CircularIndeterminate()
      // } else if (screen.value == ScreenState.Start) {
      //   page.value = StartScreen
      // }

    };

    return () => socket.close()
  }, [])
  return null
}

const StatusCheck = () => {

  // client sends a status check to the server every 2 minutes
  // if the server does not receive a status check within 3 minutes of last check it will shut down the connection
  // that 1 min leeway is to prevent high ping from disconnecting normal users
  // the status check is done to prevent illegal data manip on client side

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    console.debug("timer started")
    if(timerRef.current){
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {

      // now I know that the socket is not *garunteed* garunteed to have made the connection at this point
      // but if the client failed to make a connection after 2 minutes we have bigger problems

      console.debug("status check o clock")

      // normally i would split all the different status checks into their own file/function of the relevant screen
      // but since we need to use the same timer so i dont want to make multiple timers just to status check
      // so they are all aggregated here, which is fine as no reply from the server should be sent anyways so no need to handle that

      if (screen.value = ScreenState.Start){
        //start screen check items: token
        socket.send(nonce.value + "1STATUS" + token.value)
        startTimer()
        console.debug("sent \"" + nonce.value + "1STATUS" + token.value)
      }
      
    }, 120000) // set it to 2 mins later (btw its in milliseconds)
  }

  useEffect(() => {

    startTimer()
  })

  return null
}

const InactivityLogout = () => {
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

    startTimer(); // Start the inactivity timer when the component mounts

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

export function changeScreen(path: string){
  const navigator = useNavigate()
  navigator(path)
}

export default App
