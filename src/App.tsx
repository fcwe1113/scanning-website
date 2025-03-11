import { useEffect, useRef } from 'react'
import './App.css'
import { ScreenState } from './Screen_state';
import { token_exchange, Loading } from './Token_exchange';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Start, { login_screen } from './Start'
import SignUp, { sign_up_screen } from './Sign_up'
import LocateStore from './Locate_store';

export class referenceObj {
  value: any = ScreenState.Loading;

  constructor(value: any) {
    this.value = value
  }
}

let screen: referenceObj = new referenceObj(ScreenState.Loading)
// let page: referenceObj = new referenceObj(CircularIndeterminate())
let token = new referenceObj(new String("-1"))
export let nonce = new referenceObj(new String("-1"))
let lastChecked = new Date()
export let username = new referenceObj(new String("-1"))
const StatusCheckInterval = 120000 // set it to 2 mins later (btw its in milliseconds)
const useCloud = true
const BackendLink = useCloud ? "wss://efrgtghyujhygrewds.ip-ddns.com:8080/" : "ws://localhost:8080/" // change the ip accordingly

// this block will block the rest of the code from running before it is done
// i dont know how to async it yet so yea change it when i know how pls
// let keypair = forge.pki.rsa.generateKeyPair({bits: 2048})
// let private_key: String | CryptoKey
// let public_key: string
// let key
// let server_public_key: referenceObj = new referenceObj("")
// let keyRdy: referenceObj = new referenceObj(false)
// let keyReceived: referenceObj = new referenceObj(true)
export var socket: WebSocket

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
          <Route path="/scanning-website/locatestore" element={<LocateStore />} />
          <Route path="/scanning-website/signup" element={<SignUp />} />
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

    socket = new WebSocket(BackendLink)
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
      // 2 = sign up screen
      // 3 = store locator
      // 4 = main app (the scanning screen)
      // 5 = payment screen
      // 6 = transferring to till (either by choice or to check id)
      // 7 = after payment/logging out

      let response = evt.data

      let oprand = response.slice(0, 1)
      response = response.replace(oprand, "")
      let dest: string | undefined
      switch (oprand) {
        case "S":
          if (response.slice(0, 5) == "TATUS") {
            nonce.value = response.replace("TATUS", "")
            console.debug("new nonce rceived: " + nonce.value)
          }
          break

        case "0":
          if (await token_exchange(socket, response, screen, token, nonce)) {
            navigator("/scanning-website/login")
          }
          console.debug("screen state: " + screen.value)
          break

        case "1":

          dest = login_screen(socket, response, screen, nonce)
          if (dest == "2") {
            navigator("/scanning-website/signup")
          } else if (dest == "3") {
            navigator("/scanning-website/locatestore")
          }
          break
        case "2":

          dest = sign_up_screen(socket, response, screen, nonce)
            if (dest == "1") {
              navigator("/scanning-website/login")
            } else if (dest == "3") {
              navigator("/scanning-website/locatestore")
            }
            break

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
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {

      // now I know that the socket is not *garunteed* garunteed to have made the connection at this point
      // but if the client failed to make a connection after 2 minutes we have bigger problems

      console.debug("status check o clock")

      // normally i would split all the different status checks into their own file/function of the relevant screen
      // but since we need to use the same timer so i dont want to make multiple timers just to status check
      // so they are all aggregated here, which is fine as no reply from the server should be sent anyways so no need to handle that

      // console.log(screen.value)
      if (screen.value == ScreenState.Start || screen.value == ScreenState.SignUp) { // 2b.
        //start screen check items: token
        socket.send(nonce.value + (screen.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)
        startTimer()
        console.debug("sent \"" + nonce.value + (screen.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)
      }

    }, StatusCheckInterval)
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

export function changeScreen(path: string) {
  const navigator = useNavigate()
  navigator(path)
}

export default App
