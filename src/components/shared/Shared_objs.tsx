import {ScreenState} from "./Screen_state.tsx";
import {createContext} from "react";

export class referenceObj {
    value: unknown

    constructor(value: unknown) {
        this.value = value
    }
}

export const screenStateObj: referenceObj = new referenceObj(ScreenState.Loading)
export const token = new referenceObj(String("-1"))
export const nonce = new referenceObj(String("-1"))
export const username = new referenceObj(String("-1"))
export const shopListArray: string[] = []
export const shopList = new referenceObj(shopListArray)
export const storeID = new referenceObj(-1 as number)
export const screenContext = createContext(ScreenState.Loading)

export let socket: WebSocket

export const connect = (BackendLink: string) => {
    socket = new WebSocket(BackendLink)
}

export function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

export const setGlobalScreenState = new referenceObj("")

export function getScreenState() {
    // todo
}