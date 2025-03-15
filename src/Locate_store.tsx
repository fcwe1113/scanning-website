import BarcodeScannerComponent from "react-qr-barcode-scanner";
import React, { useEffect, useState } from 'react';
import { getWindowDimensions } from "./App.tsx";
import {receivingList, referenceObj, shopList} from "./Reference_objects.tsx";
import "./cameraUI.css"
import "./index.css"
// import { ScreenState } from "./Screen_state.tsx";

// camera module from https://github.com/jamenamcinteer/react-qr-barcode-scanner

let setScannerResult: React.Dispatch<React.SetStateAction<string>> // setter for scanner result
let setScanningState: React.Dispatch<React.SetStateAction<boolean>>
// let setLoadingList: React.Dispatch<React.SetStateAction<boolean>>


const cameraHeight = 0.4 // in percentage ofc

const getDefaultFontSize = () => {

    const element = document.createElement('div');
    element.style.width = '1rem';
    element.style.display = 'none';
    document.body.append(element);
    const widthMatch = window
        .getComputedStyle(element)
        .getPropertyValue('width')
        .match(/\d+/);
    element.remove();
    if (!widthMatch || widthMatch.length < 1) {
        return 1; // if the function ever return 1 we have bigger issues
    }

    const result = Number(widthMatch[0]);
    return !isNaN(result) ? result : 1;
};

const LocateStore: React.FC = () => {

    const [result, setResult] = useState("");
    const [scanning, setScanning] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, _setLoading] = useState(true);
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    const [promptHeight, setPromptHeight] = useState(0);

    setScannerResult = setResult
    setScanningState = setScanning;
    // setLoadingList = setLoading
    const defaultFontSize = getDefaultFontSize()
    const fullHeight = (windowDimensions.height / defaultFontSize - 4) * defaultFontSize
    const fullWidth = (windowDimensions.width / defaultFontSize - 4) * defaultFontSize

    useEffect(() => {
        if(result){
            alert(result)
        }
    }, [result])

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setPromptHeight((document.getElementById("promptDiv") as HTMLDivElement).clientHeight)
    }, [(document.getElementById("promptDiv") as HTMLDivElement)]);

    const cameraUIvars = {
        "--UI-height": String(fullHeight) + "px",
        "--camera-height": String(fullHeight * cameraHeight) + "px",
        "--content-height": String(fullHeight * (1 - cameraHeight)) + "px",
    } as React.CSSProperties

    const list = (list: referenceObj) => {
        if (receivingList) {
            return (
                <>
                    <p>Loading...</p>
                </>
            )
        }

        // let output: Element = (<></>)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        for (let i = 0; i < list.value.length; i++) {
            // const json = JSON.parse(list.value[i])
        }
    }

    return (
        <>
            <div id={"cameraUIWrapper"} style={cameraUIvars}>
                <div id={"cameraDiv"}>
                    <BarcodeScannerComponent
                        width={fullWidth}
                        height={fullHeight * cameraHeight}
                        onUpdate={(_err: unknown, value) => { // this will run pretty much constantly as even when there isnt a code scanned it will run
                            if (scanning) {
                                if (value) {
                                    setScanningState(false)
                                    resolveScan(value.getText())
                                } else {
                                    // do nothing
                                }
                            }
                        }}
                        delay={1000} // i am guessing this is 1000 millis???
                    />
                </div>
                <div id={"contentDiv"}>
                    <div id={"promptDiv"}>
                        <p>Please allow camera permissions, or choose a store from the list below</p>
                    </div>
                    <div id={"listDiv"} style={ { "--prompt-height": String(promptHeight) + "px" } as React.CSSProperties }>
                        {list(shopList)}
                        <p>
                            Lorem ipsum odor amet, consectetuer adipiscing elit. Maecenas mauris cras malesuada pellentesque, sapien pellentesque rutrum. Volutpat netus turpis integer placerat cubilia magna. Sollicitudin viverra nullam fringilla fames lobortis. Bibendum integer aliquam vestibulum luctus ornare. Arcu viverra ultricies consequat porttitor nostra ullamcorper et nibh.

                            Blandit sodales etiam tempor duis dictumst. Placerat velit montes torquent interdum integer. Dignissim euismod nam sollicitudin mattis fusce posuere fringilla. Pellentesque rhoncus nibh, arcu penatibus semper vulputate? Vulputate donec tellus potenti justo mattis. Ipsum venenatis rutrum orci quis adipiscing mi hendrerit primis.

                            Venenatis cursus tempor amet quam orci urna sapien purus. Torquent vivamus cursus senectus vel aliquet blandit curae tincidunt. Congue taciti libero diam; elementum natoque viverra. Bibendum dolor sollicitudin molestie; duis gravida eros blandit maximus. Fermentum dapibus platea orci pharetra venenatis consectetur praesent dignissim. Odio eu morbi laoreet rutrum erat tortor; ultricies sagittis.

                            Eget est risus dapibus porta nisi morbi senectus cursus. Felis lobortis vitae imperdiet massa felis aenean amet. Potenti nam etiam sagittis eu quis ac ut congue venenatis. Id venenatis tellus imperdiet ad ultricies proin bibendum. Condimentum parturient laoreet maximus curae conubia commodo fermentum mauris aliquam. Facilisis dictumst volutpat in cubilia mauris dignissim facilisi et. Sit ipsum posuere neque fringilla per a.

                            Magna netus mollis venenatis curabitur natoque aliquet magnis. Fringilla luctus ornare magnis taciti pharetra. Magnis pretium diam imperdiet; mollis aliquam massa. Imperdiet nunc dui purus dictum etiam egestas inceptos mollis. Non congue class nibh felis bibendum aenean luctus magna. Libero hendrerit adipiscing aenean; tincidunt et massa tincidunt. Litora platea commodo laoreet vulputate est fringilla. Nostra ultrices eu penatibus posuere dui. Pellentesque adipiscing mus tincidunt auctor sodales finibus.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )

}

function resolveScan(result: string){
    setScannerResult(result)
    setScanningState(true)
}

export const store_locator_screen = (socket: WebSocket, response: string, /*screen: referenceObj,*/ nonce: referenceObj) => {
    // message handler for store locator screen

    if (response.slice(0, 4) == "LIST") { // backend sends this back if either/both username and password is wrong
        response = response.slice(5, response.length)
        const json: Array<string> = JSON.parse(response)
        console.log("hi " + json.list);
        return ""
    } else if (response.slice(0, 7) == "BADFORM") {
        alert(response.replace("BADFORM", ""))
        return ""
    }

    return "4" // should not do anything, remove this later
}

export default LocateStore