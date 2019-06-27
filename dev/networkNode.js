const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const rp = require('request-promise');
const bitcoin = new Blockchain();
const port = process.argv[2];



const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
 

//get entire blockchain 
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
  //res.send('its working!...');
});

//create a new transaction
app.post('/transaction', function(req, res){
	// console.log(req.body);
	// res.send('The amount of the transaction is ${req.body.amount} bitcoins');
	// res.send('Its Work!');

	// const blockdetail = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	// console.log(blockdetail);
	// res.json({ note: 'Transaction will be added in block '+blockdetail.index});
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: 'transaction will be added in block '+blockIndex+'.'});
});

app.post('/transaction/broadcast', function(req, res){
	const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.'});
	});
});

//mine a block
app.get('/mine', function(req, res){

	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions : bitcoin.pendingTransactions,
		node : lastBlock['index'] + 1 
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

	//reward
	//bitcoin.createNewTransaction(12.5,"00", nodeAddress);
	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl =>{
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note : 'New block mined & broadcast successfully',
			block : newBlock
		});	
	});

	
}); 

app.post('/receive-new-block', function(req, res){
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
	
	if(correctHash && correctHash){
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	}else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});

//register a new node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res){ 
	const newNodeUrl = req.body.newNodeUrl;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1  ) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises =[];
	//reqest to all nodes
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));//push all request to all nodes
	});

	Promise.all(regNodesPromises)
	.then(data => {
		//use the data...
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: {allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ]},
			json: true	
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.'});
	});
});

//register a node with the network
app.post('/register-node', function(req, res){
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl)==-1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.'});
});

//register multiple node at once
app.post('/register-nodes-bulk', function(req, res){
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});
	res.json({ note: 'Bulk registration successful.'});
});


app.get('/consensus', function(req, res){
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl =>{
		const requestOptions = {
			uri: networkNodeUrl + '/Blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

			blockchain.forEach(blockchain => {
			if(blockchain.chain.length > maxChainLength){
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});

		if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});	
		}
		else if(newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
			
	});
});

app.get('/block/:blockHash', function(req, res){
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.josn({
		block: correctBlock
	});
});

app.get('/transaction/:transactionId', function(req, res){
	const transactionId = req.params.transactionId;
	const transactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: transactionData.transaction,
		block: transactionData.block
	});
});

app.get('/address/:address', function(req, res){
	const address =  req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({
		addressData: addressData
	});
});

app.get('/block-explorer', function(req, res){
	res.sendFile('./block-explorer/index.html', { root: __dirname});
});
app.listen(port, function(){
	console.log('Listening on port '+port+'...');
});