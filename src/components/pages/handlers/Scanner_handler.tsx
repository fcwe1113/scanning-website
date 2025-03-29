import {
    checkoutTotal,
    getGlobalShoppingList,
    Item, nonce, referenceObj, scannerReload,
    scanningNotify, socket,
    tempQuantity
} from "../../shared/Shared_objs.tsx";
import {ScreenState} from "../../shared/Screen_state.tsx";

// 4 = main_app
    // a. check items: token, username, storeid
    // b. do regular status checks until user checkout***
    // c. user is free to scan/type in random barcodes and everytime they do that id gets sent up to the server appended with "4ITEM"***
        // note the id is a positive integer to both ends will need to sanitize it before sending it to server/querying the db with it
        // I. server would look at the id and ping back the item name, price and minimum age in a json in the format of "4ITEM[json]"
            // if the id given is invalid the server would ping "4INVALID"
            // note the server WILL NOT be keeping track of the shopping list in this stage
    // d. client takes in the json and display the item on a list on screen***
    // e. when user clicks the checkout button client sends the entire list of items as a json with quantity up to server like "4CHECKOUT[json]"***
    // f. server sends an ACK
    // g. move on to payment

export const MainScannerHandler = (response: string, screen: referenceObj) => {
    if (response.slice(0, 4) === "ITEM") { // 4e.
        let error = false
        response = JSON.parse(response.slice(4, response.length))
        console.log(response)

        // if item must be counted by integer reject float quantity
        if (!(response["divisible" as unknown as number] as unknown as boolean)) {
            if (tempQuantity.value as unknown as number % 1 !== 0){
                (scanningNotify.value as (name: string) => object)("-2");
                error = true
            }
        } else { // if item can be counted with float reject quantity at 0
            if (tempQuantity.value as unknown as number === 0.0){
                (scanningNotify.value as (name: string) => object)("-2");
                error = true
            }
        }

        if(!error){
            // see if item already in list
            const originalList: Item[] = (getGlobalShoppingList.value as () => Item[])()
            let found = false
            Array.from(originalList).forEach((item) => {
                if (item.id === response["id" as unknown as number]) {
                    found = true
                    item.quantity += tempQuantity.value as number === 0.0 ? 1 : tempQuantity.value as number
                    item.quantity = Math.round(item.quantity * 100) / 100 // this is to prevent insane floats like 0.2000000000000001
                }
            })

            if (!found) { // make new record if not in list already
                originalList.push(new Item(
                    response["id" as unknown as number],
                    response["name" as unknown as number],
                    response["price" as unknown as number] as unknown as number,
                    response["age_limit" as unknown as number] as unknown as number,
                    response["divisible" as unknown as number] as unknown as boolean,
                    tempQuantity.value === 0.0 ? 1 : tempQuantity.value as number
                ));
            }

            // known bug:
            // the notify toast message wont appear if the item inputted is new (i.e. is not in the list already)
            (scannerReload.value as () => void)(); // manually reload the scanner page because of react jank yaaaaaaayyyyyyy
            (scanningNotify.value as (name: string, quantity?: number) => object)(response["name" as unknown as number], tempQuantity.value as unknown as number)
            tempQuantity.value = 0.0;
        }

        return ""
    } else if (response == "INVALID") {
        (scanningNotify.value as (name: string) => object)("-1")
        return ""
    } else if (response == "ACK") {
        socket.send(nonce.value + "4NEXT" + checkoutTotal.value)
        console.debug("sent 4NEXT")
    } else if (response == "NEXT") { // 4g.
        screen.value = ScreenState.Payment
        console.debug("move to payment")
        return "5"
    }

    return "" // should not happen
}