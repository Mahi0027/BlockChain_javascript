const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const testData = {
"chain": [
{
"index": 1,
"timestamp": 1558725241392,
"transactions": [],
"nonce": 100,
"hash": "0",
"previousBlockHash": "0"
},
{
"index": 2,
"timestamp": 1558725363769,
"transactions": [
{
"amount": 100,
"sender": "ARWFDGER90EBERHG5EGSG0S98G9S89",
"recipient": "SA0A0SD0GA0AEGDFG0ERHT0E9RH7W0"
},
{
"amount": 200,
"sender": "ARWFDGER90EBERHG5EGSG0S98G9S89",
"recipient": "SA0A0SD0GA0AEGDFG0ERHT0E9RH7W0"
},
{
"amount": 300,
"sender": "ARWFDGER90EBERHG5EGSG0S98G9S89",
"recipient": "SA0A0SD0GA0AEGDFG0ERHT0E9RH7W0"
}
],
"nonce": 112645,
"hash": "00006b6cb9793ee706673a6ead0b279c27cf85ab565132c5bbdae1f4c110715a",
"previousBlockHash": "0"
},
{
"index": 3,
"timestamp": 1558725372525,
"transactions": [
{
"index": 3,
"amount": 12.5,
"sender": "00",
"recipient": "16a95a107e5811e9bfbbc3c2c0c4ebc5",
"transactionId": "5f9fc9c07e5811e9bfbbc3c2c0c4ebc5"
}
],
"nonce": 15084,
"hash": "0000d346849d2bd7e8bffe417a20b1736054d25ce69f6e74e41bc6904e98e0ff",
"previousBlockHash": "00006b6cb9793ee706673a6ead0b279c27cf85ab565132c5bbdae1f4c110715a"
}
],
"pendingTransactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "16a95a107e5811e9bfbbc3c2c0c4ebc5",
"transactionId": "64d31e107e5811e9bfbbc3c2c0c4ebc5"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
};

console.log('VALID : ', bitcoin.chainIsValid(testData.chain));
// bitcoin.createNewBlock(123245,'SDLFJWEJLF0AERG0EHER','FAESDGOGRSGOE43T4')

// console.log(bitcoin);

// const previousBlockHash='ADSFERPREGLK809EGRE0GRGRE0GER';
// const curentBlockData=[
// 	{
// 		amount: 100,
// 		sender: 'AODFKSDMO0DFDGPFDGGFDGFF',
// 		recipient: 'AOISDOFSJDOG0WEG0BFGERGG'
// 	},
// 	{
// 		amount: 200,
// 		sender: 'ASLDKFPOSWE;FGMPVOERFREG',
// 		recipient: 'KJFOPGET540ERODGKMG5ERRG'
// 	}
// ];

// console.log(bitcoin.proofOfWork(previousBlockHash, curentBlockData));	