import {nonce, screenStateObj, socket, storeID, token, username} from "./Shared_objs.tsx";
import {ScreenState} from "./Screen_state.tsx";

const StatusCheckInterval = 120000 // set it to 2 mins later (btw its in milliseconds)

// client sends a status check to the server every 2 minutes
// if the server does not receive a status check within 3 minutes of last check it will shut down the connection
// that 1 min leeway is to prevent high ping from disconnecting normal users
// the status check is done to prevent illegal data manip on client side

export const startStatusCheckTimer = (timerRef: React.MutableRefObject<NodeJS.Timeout | null>) => {

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

        if (screenStateObj.value == ScreenState.Login || screenStateObj.value == ScreenState.SignUp) { // 2b.
            //start screen check items: token
            socket.send(nonce.value + (screenStateObj.value == ScreenState.Login ? "1" : "2") + "STATUS" + token.value)
            console.debug("sent \"" + nonce.value + (screenStateObj.value == ScreenState.Login ? "1" : "2") + "STATUS" + token.value)
        } else if (screenStateObj.value == ScreenState.StoreLocator) {
            socket.send(nonce.value + "3STATUS" + token.value + username.value)
            console.debug("sent \"" + nonce.value + "3STATUS" + token.value + username.value)
        } else if (screenStateObj.value == ScreenState.MainScanner) {
            socket.send(nonce.value + "4STATUS" + token.value + username.value + storeID.value)
            console.debug("sent \"" + nonce.value + "4STATUS" + token.value + username.value + storeID.value)
        }

        startStatusCheckTimer(timerRef)

    }, StatusCheckInterval)
}