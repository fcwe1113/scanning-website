import CircularIndeterminate from "../shared/Loading_screen.tsx"

// messages sent from both ends should follow a similar format (at least for the first few chars)
// *** denotes client side tasks
// 0 = token exchange
// a. when the websocket channel opens the server will generate the key pair and send the public key to the client,
// b. the client receives the public key then generates its own key pair, if the client isnt ready ping over WAIT instead***
// c. client sends the public key over and encrypting it with the server's public key***
// EVERYTHING PAST THIS POINT WILL BE DONE WITH ENCRYPTION
// d. server will generate a token and send it to the client, the client would have a placeholder token which prevent the client from proceeding
// e. the client saves the token and pings back the same token to the server***
// f. the server sends an ack back if the token matches and switches the token_exchanged flag on and saves it in the list(tm)
// g. client then tells the server to move on to the start screen state***
// h. server tells client to move on then moves on itself, unless the token_exchanged flag is not on, in which case handle the error
// i. client moves on for real***
// while the client is waiting for the token exchange ack it can show a loading wheel or something idk

export const Loading: React.FC = () => {
    return (CircularIndeterminate())
}

// export Loading