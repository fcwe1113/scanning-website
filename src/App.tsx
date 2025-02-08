import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CircularIndeterminate from './Loading_screen';
import { ScreenState } from './Screen_state';
import { token_exchange } from './Token_exchange';

export class referenceObj {
  value: any = ScreenState.Loading;

  constructor(value: any){
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

let changeScreen: referenceObj = new referenceObj(false)
let screen: referenceObj = new referenceObj(ScreenState.Loading)
let page: referenceObj = new referenceObj(CircularIndeterminate())
let token = new String("-1")

function App() {

  // for the camera lib use the one demoed in kybarg.github.io/react-qr-scanner/

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080")
    socket.onopen = () => console.info("websocket connected")

    // Listen for messages
    socket.onmessage = (evt) => {
      console.info("received \"" + evt.data + "\"")

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
          changeScreen.value = token_exchange(socket, response, screen, token)
          console.debug("screen state: " + screen.value)
      }

      if (screen.value == ScreenState.Loading) {
        page.value = CircularIndeterminate()
      } else if (screen.value == ScreenState.Start) {
        page.value = StartScreen
      }
    };



    // function send(socket: WebSocket, msg: String){
    //   socket.addEventListener("open", event => {
    //     console.log("hi")
    //     socket.send(msg as string)
    //   });
    // }

    // socket.addEventListener("open", event => {
    //   // console.log("hi")
    //   socket.send("1Connection established from "/*new Blob(["Connection established from " + id])*/)
    // });

    return () => socket.close()
  }, [])

  if (changeScreen.value) {
    console.log("used screen: " + screen.value)
    if (screen.value == ScreenState.Loading) {
      page.value = CircularIndeterminate()
    } else if (screen.value == ScreenState.Start) {
      page.value = StartScreen
    }
    changeScreen.value = false
    // return page.value
  }

  return(
    <>
    {page.value}
    </>
  )
  

  // return () => {
  //   var page = (<><h1>dummy page</h1></>)
  //   return useEffect(() => {
  //     console.log("used screen: " + screen.value)
  //     if (screen.value == ScreenState.Loading) {
  //       page = CircularIndeterminate()
  //     } else if (screen.value == ScreenState.Start) {
  //       page = StartScreen
  //     }
  //   }, [screen.value])
  //   return page
  // }


}




export default App
