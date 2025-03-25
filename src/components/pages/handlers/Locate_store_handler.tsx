import {referenceObj, screenStateObj, setLoadingList, shopList, storeID} from "../../shared/Shared_objs.tsx";
import {ScreenState} from "../../shared/Screen_state.tsx";
import React from "react";

export const StoreLocatorHandler = (socket: WebSocket, response: string, /*screen: referenceObj,*/ nonce: referenceObj) => {
    // message handler for store locator screen

    if (response == "ACK") { // 3h.
        socket.send(nonce.value + "3NEXT" + storeID.value)
    } else if (response.slice(0, 4) == "LIST") { // backend sends this back if either/both username and password is wrong
        response = response.slice(4, response.length)
        shopList.value = JSON.parse(response)["list"]
        const setLoading = setLoadingList.value as React.Dispatch<React.SetStateAction<boolean>>
        setLoading(false) // if the server is too quick this will fail to run (almost impossible once deployed)

        return ""
    } else if (response.slice(0, 4) == "NEXT") {
        screenStateObj.value = ScreenState.Scanner
        console.debug("moving on to main app")
        return "4"
    }
}