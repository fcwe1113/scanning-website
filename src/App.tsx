import { useState, useEffect } from 'react'
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

function App() {
  const [count, setCount] = useState(0)

  const id = makeid(5)

  // according to here: https://github.com/facebook/create-react-app/issues/10387
  // react intentionally opens the websocket twice to bug prevention purposes, for some reason
  const socket = new WebSocket("ws://localhost:8080")

  // Connection opened
  socket.addEventListener("open", event => {
    // console.log("hi")
    socket.send("Connection established from " + id/*new Blob(["Connection established from " + id])*/)
  });

  // Listen for messages
  socket.onmessage = (evt) => {
    console.log(evt.data)
    // const message = (evt.data);
    // setMessages((prevMessages) =>
    //     [...prevMessages, message]);
  };

  // socket.addEventListener("message", event => {
  //   console.log("Message from server ", event.data)
  // });

  //1. ask if user has acc or is guest
  //  1a. if hv acc then login
  //  1b. if not either proceed as guest or sign up AKA asking name email and dob
  //2. ask which store they are in either by scanning qr or search bar
  //3. customer start scanning items
  //4. customer done shopping and pays on the site (manual input of card info or apple/google pay)
  //  4a. if their shopping list has age restricted items then pass the list to a till and hv someone check their id
  //  (not this system's problem past passing list to till)

  //for some reason the html returns hv to be packaged with empty tags like <></>
  return (
    StartScreen
    // <>
    // {/* <Box sx={{ flexGrow: 1 }}>
    //   <AppBar position="static">
    //     <Toolbar>
    //       <IconButton
    //         size="large"
    //         edge="start"
    //         color="inherit"
    //         aria-label="menu"
    //         sx={{ mr: 2 }}
    //       >
    //         <MenuIcon />
    //       </IconButton>
    //       <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
    //         News
    //       </Typography>
    //       <Button color="inherit">Login</Button>
    //     </Toolbar>
    //   </AppBar>
    // </Box> */}
    //   {/* <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div> */}
      
    //   {/* <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to test HMR
    //     </p>
    //   </div> */}
      
    // </>
    
  )
}

const StartScreen = (
    <>
    <h1>Welcome to the Scanning app</h1>
    <input placeholder='username'></input>
    <input placeholder='password'></input>
    <div>
      <button>Sign in</button><br/>
      <button>Sign up</button><br/>
      <button>Proceed as guest</button>
    </div>
    </>
  )

  function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }


export default App
