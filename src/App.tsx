import { useEffect, useRef } from 'react'
import './App.css'
import {ScreenState} from './components/shared/Screen_state.tsx';
import { Loading } from './components/pages/Token_exchange.tsx';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  checkoutTotal,
  connect,
  nonce,
  screenStateObj,
  socket,
  storeID,
  token,
  username
} from "./components/shared/Shared_objs.tsx";
import {MainScanner} from "./components/pages/Scanner.tsx";
import LocateStore from "./components/pages/Locate_store.tsx";
import SignUp from "./components/pages/Sign_up.tsx";
import Login from './components/pages/Login.tsx';
import {TokenExchangeHandler} from "./components/pages/handlers/Token_exchange_handler.tsx";
import {LoginScreenHandler} from "./components/pages/handlers/Login_handler.tsx";
import {SignUpHandler} from "./components/pages/handlers/Sign_up_handler.tsx";
import {StoreLocatorHandler} from "./components/pages/handlers/Locate_store_handler.tsx";
import {MainScannerHandler} from "./components/pages/handlers/Scanner_handler.tsx";
import {Payment} from "./components/pages/Payment.tsx";
import {PaymentHandler} from "./components/pages/handlers/Payment_handler.tsx";

const StatusCheckInterval = 120000 // set it to 2 mins later (btw its in milliseconds)
const useCloud = true
const BackendLink = useCloud ? "wss://efrgtghyujhygrewds.ip-ddns.com:8080/" : "ws://localhost:8080/" // change the ip accordingly

function App() {
  // const navigator = useNavigate()

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
            <Route path="/scanning-website/login" element={<Login />} />
            <Route path="/scanning-website/scanner" element={<MainScanner />} />
            <Route path="/scanning-website/payment" element={<Payment />} />
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

  window.onbeforeunload = (event) => {
    event.preventDefault()
    navigator("/scanning-website/")
    return ''
  }

  useEffect(() => {

    connect(BackendLink)
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
          if (await TokenExchangeHandler(socket, response, screenStateObj, token, nonce)) {
            navigator("/scanning-website/login")
          }
          console.debug("screen state: " + screenStateObj.value)
          break

        case "1":

          switch (LoginScreenHandler(socket, response, screenStateObj, nonce)) {
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
          switch (SignUpHandler(socket, response, screenStateObj, nonce)) {
            case "1":
              navigator("/scanning-website/login")
              break
            case "3":
              navigator("/scanning-website/locatestore")
              socket.send(nonce.value + "3LIST") // 3c.
              break
          }
          break

        case "3":
          switch (StoreLocatorHandler(socket, response, nonce)) {
            case "4":
              navigator("/scanning-website/scanner")
              break
          }
          break
        case "4":
          switch (MainScannerHandler(response, screenStateObj)) {
            case "5":
              navigator("/scanning-website/payment")
              socket.send(nonce.value + "5CARDREC")
              break
          }
          break
        case "5":
          PaymentHandler(response)
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
      // so they are all aggregated here

      if (screenStateObj.value == ScreenState.Start || screenStateObj.value == ScreenState.SignUp) { // 2b.
        socket.send(nonce.value + (screenStateObj.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)
        console.debug("sent \"" + nonce.value + (screenStateObj.value == ScreenState.Start ? "1" : "2") + "STATUS" + token.value)

      } else if (screenStateObj.value == ScreenState.StoreLocator) {
        socket.send(nonce.value + "3STATUS" + token.value + username.value)
        console.debug("sent \"" + nonce.value + "3STATUS" + token.value + username.value)
      } else if (screenStateObj.value == ScreenState.Scanner) {
        socket.send(nonce.value + "4STATUS" + token.value + username.value + storeID.value)
        console.debug("sent \"" + nonce.value + "4STATUS" + token.value + username.value + storeID.value)
      } else if (screenStateObj.value == ScreenState.Payment) {
        socket.send(nonce.value + "5STATUS" + token.value + username.value + storeID.value + checkoutTotal.value)
        console.debug("sent \"" + nonce.value + "5STATUS" + token.value + username.value + storeID.value + checkoutTotal.value)
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

export default App
