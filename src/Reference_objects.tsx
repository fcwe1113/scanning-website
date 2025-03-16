import {ScreenState} from "./Screen_state.tsx";

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
// export const receivingList = new referenceObj(true)
export const shopListArray: string[] = []
export const shopList = new referenceObj(shopListArray)