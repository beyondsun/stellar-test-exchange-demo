import Stellar from 'stellar-sdk'

/* Global Vars */
//All these would be in database
var Transactions = [];
var NonLumens = [];
var Customers = ['customer1'];
var Deposits = [];
var Tokens = [];
var InvalidCustomers = [];
var handler = null;

var stellarDB = {
    token: 0
};

//Server Wrapper
const Server = (server, url) => {  
    return new server.server(url);
}

const registerHandler = (callback) =>{
    handler = callback;
}

const ServerSetup = (server, config) => {
    let messageHandler = handler;
    const server = Server(server, config.horizonApiUrl);
    //Stellar.Network.usePublicNetwork();//Enable in Live
    var lastToken = stellarDB.token;
    let depositStream = server.payments().forAccount(config.baseAccountKey);
    if (lastToken > 0) {
        depositStream.cursor(lastToken);
      }
      depositStream.stream({onmessage: messageHandler});
}

const handleNonLumens = (asset) =>{
    NonLumens.push(asset);
}

const validCustomer = (customer) => {
    var isExist = Customers.find((cust) => { return cust == customer; })
    return (isExist && isExist.length > 1);
}

const depositHandler = (deposit) => {
    if(!deposit){
        return;
    }
    if (deposit.to != config.baseAccount) {
        return;
    }
    deposit.transaction()
      .then((txn) => {
        var customer = txn.memo;
        if (deposit.asset_type != 'native') {
           //Handle non lumens
           handleNonLumens(txn); 
        } else {
          if (validCustomer(customer)) {
              Deposits.push({amt: deposit.amount, id: customer});
              stellarDB.token = deposit.paging_token;
          } else {
            InvalidCustomers.push(customer);
          }
        }
      })
      .catch(function(err) {
        InvalidCustomers.push(customer);
      });
  }

  registerHandler(depositHandler);

const getDatabaseLog = () =>{
    return {transaction : Transactions.slice(), 
    customers: Customers.slice(),
    deposits: Deposits.slice(), 
    invalidCustomers: InvalidCustomers.slice(), 
    token: stellarDB.token.toString()}
}

module.exports = {  
    StartDepositServer: ServerSetup, 
    registerHandler: registerHandler,
    getDatabaseLog: getDatabaseLog,
}