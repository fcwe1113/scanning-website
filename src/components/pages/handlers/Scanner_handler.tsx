import {
    getGlobalShoppingList,
    Item, scannerReload,
    scanningNotify,
    tempQuantity
} from "../../shared/Shared_objs.tsx";

export const MainScannerHandler = (response: string) => {
    if (response.slice(0, 4) === "ITEM") {
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
    } else if (response.slice(0, 7) == "INVALID") {
        (scanningNotify.value as (name: string) => object)("-1")
        return ""
    }

    return "5" // should not happen
}