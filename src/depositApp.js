import express from 'express'
import bodyParser from 'body-parser'
import rp from 'request-promise'
import Stellar from 'stellar-sdk'
import DepositServer from './deposit'

/* Initialize app and configure bodyParser */
const port = process.env.PORT || 4000
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//can setup based on custom node or live
var config = {
    baseAccountKey: "",
    baseAccountSecret: "",
    horizonApiUrl: "https://horizon-testnet.stellar.org"
}


DepositServer.StartDepositServer(Stellar, depositHandler, config);


/* Serve API */
var instance = app.listen(port, () => {
  console.log(`Stellar test app listening on port ${port}!`)
})