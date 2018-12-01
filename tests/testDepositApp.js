import { expect } from 'chai';
import { assert } from 'mocha';
import DepositTest from '../src/deposit';
import Stellar from 'stellar-sdk';
//tests can be mocked not to use test horizon but now just demomstarted with test horizon for usage

describe('deposit test setup', () => {
    var config = {
        baseAccountKey: "GBNPI2KIHGUCZ5GZMGMQOQISDO6WGDWYAORG4PYHDPXZMKFNQL7QG2HI",
        baseAccountSecret: "",
        horizonApiUrl: "https://horizon-testnet.stellar.org"
    };

    var testDeposit;
    before(function(){
        DepositTest.StartDepositServer(Stellar, config);
    })
    beforeEach(function(){
        
    });

  it('check message handler registered', async () => {
      const a = 0;
      const testA = "GBGBL7LC7KMUOH3ICV7CIZR5LPIU46ZCAH3TUYBM6R44KPPN2VIMQOA5";
      const seedA = "SBN4RDZ5J6GLEB755TWMQ4253EBTBLVLX5L6SWJRATDI6WESMFF6ZVCN";
    DepositTest.registerHandler(function(){
        a= 1;
    });
    const transaction = new Stellar.TransactionBuilder(testA)
      .addOperation(Stellar.Operation.payment({
        destination: config.baseAccountKey,
        asset: Stellar.Asset.native(),
        amount: '30.0000001'
      }))
      .addMemo(StellarSdk.Memo.text('customer1'))
      .build()
  
    transaction.sign(seedA);
  
    try {
      const transactionResult = await server.submitTransaction(transaction);
      expect(a).to.be(1);
      
    } catch (err) {
      //fail test
    }
  });

  it('check if invalid customer', () => {
    const a = 0;
      const testA = "GBGBL7LC7KMUOH3ICV7CIZR5LPIU46ZCAH3TUYBM6R44KPPN2VIMQOA5";
      const seedA = "SBN4RDZ5J6GLEB755TWMQ4253EBTBLVLX5L6SWJRATDI6WESMFF6ZVCN";
    DepositTest.registerHandler(function(){
        a= 1;
    });
    const transaction = new Stellar.TransactionBuilder(testA)
      .addOperation(Stellar.Operation.payment({
        destination: config.baseAccountKey,
        asset: Stellar.Asset.native(),
        amount: '30.0000001'
      }))
      .addMemo(StellarSdk.Memo.text('invalidCustomer'))
      .build()
  
    transaction.sign(seedA);
  
    try {
      const transactionResult = await server.submitTransaction(transaction);
      var log = DepositTest.getDatabaseLog();
      expect(log.invalidCustomers.length).to.greaterThan(0);
      
    } catch (err) {
      //fail test
    }
  });

  it('check non lumen asset stream', () => {
    //
  });

  it('check lumens deposited', () => {
    //
  });
});