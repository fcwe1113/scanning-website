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

function App() {
  const [count, setCount] = useState(0)
  const connection = useRef(null)
  let token = new String("-1")
  let screen: ScreenState = ScreenState.Loading // when printing we get the number

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080")
    socket.onopen = () => console.info("websocket connected")

    // socket.addEventListener("open", event => {
    //   console.log("hi")
    //   socket.send(event)
    // });

    // Listen for messages
    socket.onmessage = (evt) => {
      console.info("received \"" + evt.data + "\"")

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
      switch (oprand) {
        case "0":
          token_exchange(socket, response, screen, token)
      }
    };

    function send(socket: WebSocket, msg: String){
      socket.addEventListener("open", event => {
        console.log("hi")
        socket.send(msg as string)
      });
    }
    
      // socket.addEventListener("open", event => {
      //   // console.log("hi")
      //   socket.send("1Connection established from "/*new Blob(["Connection established from " + id])*/)
      // });

      return () => socket.close()
  }, [])
  

  
  //for some reason the html returns hv to be packaged with empty tags like <></> 
  if (screen == ScreenState.Loading) {
    return CircularIndeterminate()
  } else {
    return (
      // StartScreen
      <>
        {/* <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box> */}
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

      </>

    )
  }
}

const StartScreen = (
  <>
    <h1>Welcome to the Scanning app</h1>
    <input placeholder='username'></input>
    <input placeholder='password'></input>
    <div>
      <button>Sign in</button><br />
      <button>Sign up</button><br />
      <button>Proceed as guest</button>
    </div>
  </>
)


export default App
