import express from 'express'
import bodyParser from 'body-parser'
import rp from 'request-promise'
import Stellar from 'stellar-sdk'


/* Global Vars */
var config = {
    baseAccountKey: "",
    baseAccountSecret: "",
    horizonApiUrl: "https://horizon-testnet.stellar.org"
}

//All these would be in database
var Transactions = [];
var NonLumens = [];
var Customers = [{customerId:"1", customerAddress:""}];
var Deposits = [];
var Tokens = [];
var InvalidCustomers = [];
var Balances = [{id:'customer1', lumens: 10000}, {id:'customer2', lumens: 100}];

var stellarDB = {
    token: 0
};

//Server Wrapper
const Server = (server, url) => {  
    return new server.server(url);
}

const ServerSubmitTransaction = (server, customer, lumens, transaction) => {
    
    //Stellar.Network.usePublicNetwork();//Enable in Live
    var currentCustomer = transaction
    currentCustomer.state = "sending";

    server.loadAccount(customer.customerAddress)
    .then(function(account) {
      var transaction = new StellarSdk.TransactionBuilder(exchangeAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: customer.customerAddress,
          asset: StellarSdk.Asset.native(),
          amount: lumens
        }))
        //Ability to multisign
        /*addOperation(StellarSdk.Operation.setOptions({
            signer: {
              ed25519PublicKey: "Enter Secondary signer address",
              weight: 1
            }
          }))
          .addOperation(StellarSdk.Operation.setOptions({
            masterWeight: 1, 
            lowThreshold: 1,
            medThreshold: 2, 
            highThreshold: 2 
          }))*/
        .build();

      transaction.sign(StellarSdk.Keypair.fromSecret(config.baseAccountSecret));
      //If multi sign all parties to sign
      //transaction.sign(KeyPair of secondary address);
      return server.submitTransaction(transaction);
    }).catch(StellarSdk.NotFoundError, function(err) {
        // create the account and fund it
        var account = createAccount().then(() => {
            var transaction = new StellarSdk.TransactionBuilder(exchangeAccount)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: account.address,
            startingBalance: lumens
          }))
          .build();
  
        transaction.sign(StellarSdk.Keypair.fromSecret(config.baseAccountSecret));
        return server.submitTransaction(transaction);
        });
        
      }).then(function(transactionResult) {
        currentCustomer.state = "done";
      }).catch(function(err) {
        currentCustomer.state = "error";
      });
}

const getCustomerById = (id) =>{
    return Customers.find((customer) => { if(customer.customerId == id) {
        return customer;
    }});
}

//Iterate through transaction log, in real time this would be a query
const RunPendingTransactions = () =>{
    Transactions.map((txn) => {
        if(txn.status == "pending"){
            let server = Server(server, config.horizonApiUrl);
            let cust = getCustomerById(txn.id);
            ServerSubmitTransaction(server, cust, txn.amount, txn);
        }
    });
}

const TriggerTransactions = () => {
    //In real time this would be a listener on Collection queue
    setInterval(() => { RunPendingTransactions();}, 3000);
}


//The App listener which pushes to Transactions Database 
const withdrawRequest = (customerId, lumensWithdraw, destinationAddress) => {
    var customerBalance = Balances.find((id) => { return id == customerId;}).lumens;
    if (lumensWithdraw <= customerBalance) {
        Transactions.push({
            id: customerId,
            balance: customerBalance - lumensWithdraw,
            amount: lumensWithdraw,
            state: "pending",
        });
        Balances.map((customer) => { if(customer.id == customerId) {
            customer.lumens = customerBalance - lumensWithdraw;
        }});
    }
    else{
        //notify customers
    }
  }


/* Stellar Interactions */
const createAccount = async (res) => {  
  // Create Account and request balance on testnet
  await rp.get({
    uri: config.horizonApiUrl + '/friendbot',// real time would be a live
    qs: { addr: Stellar.Keypair.random().publicKey() },
    json: true
  })

  account = await server.loadAccount(pairA.publicKey()) ;
  res.send(account);
}

module.exports = {  
    TriggerTransactions: TriggerTransactions
}