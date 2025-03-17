import {ReactNode, useEffect, useRef, useState} from 'react'
import './App.css'
import {ScreenState} from './components/shared/Screen_state.tsx';
import {Token_exchange} from './components/Token_exchange/Token_exchange.tsx';
import Login from './components/Login/Login.tsx'
import SignUp from './components/Sign_up/Sign_up.tsx'
import {connect, screenContext, setGlobalScreenState, socket} from "./components/shared/Shared_objs.tsx";
import {MainScanner} from "./components/Scanner/Scanner.tsx";
import LocateStore from "./components/Locate_store/Locate_store.tsx";
import BackendTalk, {BackendLink} from './hooks/BackendTalk.tsx';
import {startStatusCheckTimer} from "./components/shared/useStatusCheck.tsx";

function App(): ReactNode {
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const [screen, setScreen] = useState<ScreenState>(screenContext);
  // const [screenState, setScreenState] = useState<ScreenState>(ScreenState.Loading);
  // const useEffectTrigger = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  startStatusCheckTimer(timerRef)
  setGlobalScreenState.value = setScreen

  connect(BackendLink)
  socket.onopen = () => console.log("websocket connected")
  socket.onmessage = (event: MessageEvent) => {
    console.debug("received \"" + event.data + "\"")
    BackendTalk(event.data)
  }

  // useEffect(() => { // essentially the websocket listener
  //   connect(BackendLink)
  //   socket.onopen = () => console.log("websocket connected")
  //   const asyncListener = async () => {
  //     socket.onmessage = async (evt) => {
  //     console.debug("received \"" + evt.data + "\"")
  //     BackendTalk(evt.data)
  //     // useBackendTalk(evt.data)
  //     // useEffectTrigger.current = !useEffectTrigger.current // is here so the hook keeps running
  //   };}
  //   asyncListener().then(() => {})

    // connect(BackendLink)
    // socket.onopen = () => console.debug("websocket connected")
    // socket.onmessage = async (evt) => {
    //   console.debug("received \"" + evt.data + "\"")
    //   BackendTalk(evt.data)
    //   // useBackendTalk(evt.data)
    //   useEffectTrigger.current = !useEffectTrigger.current // is here so the hook keeps running
    // };
  //   return () => {} // may cause problems???
  // }, [])

  useEffect(() => {
    // todo
    // might be that the page would rerun everytime the var change?
    setScreen(screen)
  }, [screen]);

  switch (screen) {
    case ScreenState.Loading:
      return Token_exchange() as unknown as ReactNode
    case ScreenState.Login:
      return Login() as unknown as ReactNode
    case ScreenState.SignUp:
      return SignUp() as unknown as ReactNode
    case ScreenState.StoreLocator:
      return LocateStore() as unknown as ReactNode
    case ScreenState.MainScanner:
      return MainScanner() as unknown as ReactNode
    default: // should never happen but who knows lol
  }

  return (<><p>critical error i guess???</p></>) as unknown as ReactNode

}

export default App
