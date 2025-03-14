import { useEffect, useRef } from 'react'
import './App.css'
import {ScreenState} from './Screen_state';
import { token_exchange, Loading } from './Token_exchange';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Start, { login_screen } from './Start'
import SignUp, { sign_up_screen } from './Sign_up'
import LocateStore, { store_locator_screen } from './Locate_store';
import {nonce, screenStateObj, token, username} from "./Reference_objects.tsx";

const lastChecked = new Date()
const StatusCheckInterval = 120000 // set it to 2 mins later (btw its in milliseconds)
const useCloud = false
const BackendLink = useCloud ? "wss://efrgtghyujhygrewds.ip-ddns.com:8080/" : "ws://localhost:8080/" // change the ip accordingly
export let socket: WebSocket

export function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

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

      const oprand = response.slice(0, 1)
      response = response.replace(oprand, "")
      switch (oprand) {
        case "S":
          if (response.slice(0, 5) == "TATUS") {
            nonce.value = response.replace("TATUS", "")
            console.debug("new nonce rceived: " + nonce.value)
          }
          break

        case "0":
          if (await token_exchange(socket, response, screenStateObj, token, nonce)) {
            navigator("/scanning-website/login")
          }
          console.debug("screen state: " + screenStateObj.value)
          break

        case "1":

          switch (login_screen(socket, response, screenStateObj, nonce)) {
            case "2":
              navigator("/scanning-website/signup")
              break
            case "3":
              navigator("/scanning-website/locatestore")
              socket.send(nonce.value + "3LIST")
              break
          }
          break
        case "2":
          switch (sign_up_screen(socket, response, screenStateObj, nonce)) {
            case "1":
              navigator("/scanning-website/login")
              break
            case "3":
              navigator("/scanning-website/locatestore")
              socket.send(nonce.value + "3LIST")
              break
          }
          break

        case "3":
          switch (store_locator_screen(socket, response, /*screenStateObj, */nonce)) {
            case "4":
              // switch to main app
              break
          }
          break
      }

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

      // normally i would split all the different status checks into their own file/function of the relevant screenStateObj
      // but since we need to use the same timer so i dont want to make multiple timers just to status check
      // so they are all aggregated here, which is fine as no reply from the server should be sent anyways so no need to handle that

      // console.log(screenStateObj.value)
      if (screenStateObj.value == ScreenState.Start || screenStateObj.value == ScreenState.SignUp) { // 2b.
        //start screen check items: token
        socket.send(nonce.value + (screenStateObj.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)
        console.debug("sent \"" + nonce.value + (screenStateObj.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)

      } else if (screenStateObj.value == ScreenState.StoreLocator) {
        socket.send(nonce.value + "3STATUS" + token.value + username.value)
        console.debug("sent \"" + nonce.value + "3STATUS" + token.value + username.value)
      }

      startTimer()

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

export default App
