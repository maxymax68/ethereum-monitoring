var mongoose = require('mongoose');
var Tx = require('./tx');
var sleep = require('system-sleep');

const Etherscan = require('etherscan');
const etherscan = new Etherscan('N7IJX6IJW1PRARBZ3XUTW6N19Q1ZKNB8Z4'); // Some methods working without API_KEY
const timer = ms => new Promise( res => setTimeout(res, ms));
var addresses = [
	{'number': 1, 'owner': 'Rob', 'description': 'expenses and inter-company', 'company': 'Pillar Project AG', 'wallet': 'Spectrocoin', 'ether': '0x56124Fe6Dfe434Fd67880b762CC389c9cff0A6c4'},
	{'number': 2, 'owner': 'David/Tomer', 'description': 'Re-used cash pre-sale wallet', 'company': 'Pillar Project AG', 'wallet': 'Spectrocoin', 'ether': '0xb333991eb6e824e979cdd357ba7ce1b3fead19c8'},
	{'number': 3, 'owner': 'Rob', 'description': 'For Pillar Project AG only', 'company': 'Pillar Project AG', 'wallet': 'Spectrocoin', 'ether': '0x7542a6a3c678bffc67a6c5edb8b62f99fb4bf9ae'},
	{'number': 6, 'owner': 'David', 'description': 'Ether', 'company': 'Pillar Project AG', 'wallet': 'Jaxx', 'ether': '0xb119d1a57df103d2158414528be15355e49c67ad'},
	{'number': 7, 'owner': 'David', 'description': 'Ether', 'company': 'Pillar Project AG', 'wallet': 'Jaxx', 'ether': '0x4f3f0784f1b45d6c5699d4145a3c6dc24429ff74'},
	{'number': 10, 'owner': 'David', 'description': 'Ether', 'company': 'Pillar Project AG', 'wallet': '', 'ether': '0xdaedf5f491a8a052c03d9c497d27da2530afa6ae'},
	{'number': 11, 'owner': 'Rob', 'description': 'Ether', 'company': 'Pillar Project AG', 'wallet': '', 'ether': '0x7f52ee973721702bb9f8c954e5754e83a1483311'},
	{'number': 12, 'owner': 'Charles', 'description': 'Diversification', 'company': 'Foundation', 'wallet': '', 'ether': '0x97129b07b5f8bae8e91ed0219624fd6e64a17da6'},
	{'number': 14, 'owner': 'Pierre', 'description': 'Pillar Worldwide Expenses', 'company': 'Pillar Worldwide', 'wallet': 'Jaxx', 'ether': '0x7844c6ef931cc2f87064414b2dc7f57f8ee17fac'},
	{'number': 16, 'owner': 'Sasha', 'description': 'Pillar Worldwide Expenses', 'company': 'Pillar Worldwide', 'wallet': 'Jaxx', 'ether': '0x595dF6B10d528fAF768760355aa2C005B99a4986'},
	{'number': 18, 'owner': 'Pierre', 'description': 'Pillar Worldwide Expenses', 'company': 'Pillar Worldwide', 'wallet': 'Exodus', 'ether': '0xa59f56c63562b44b28d57c5326cbdf5935e31f7b'},
	{'number': 19, 'owner': 'Rob/Michael', 'description': 'Ether - from Main ICO sale', 'company': 'Foundation', 'wallet': 'Gnosis', 'ether': '0x05A9aFD79a05C3e1AFEFa282Ef8d58F9366B160B'},
	{'number': 20, 'owner': 'Rob/Michael', 'description': 'Ether - from Pre-sale', 'company': 'Foundation', 'wallet': 'Gnosis', 'ether': '0x9c5254d935cf85bb7bebdd8558d3b11cd27a387d'},
	{'number': 21, 'owner': 'Michael', 'description': 'Pillar Tokens (MyETher)', 'company': 'Foundation', 'wallet': '', 'ether': '0x4162Ad6EEc341e438eAbe85f52a941B078210819'},
	{'number': 22, 'owner': 'Michael', 'description': 'Pillar Tokens (Smart Contract)', 'company': 'Foundation', 'wallet': '', 'ether': '0x0E3e19058a2f238aD8ff4258CD8551108B0Bb4F0'},
	{'number': 23, 'owner': 'David', 'description': 'Used to send to Sasha and WW', 'company': 'Foundation', 'wallet': '', 'ether': '0xa36ae0f959046a18d109dc5b1fb8df655cf0aa81'}
];

mongoose.connect('mongodb://localhost/mongoose_basics', function (err) {
	if (err) console.log(err);
	console.log('Successfully connected');
});

processData (addresses, 0);

function processData (addresses, index){

	if (index == addresses.length){
		mongoose.connection.close();
		return;
	}
	else{
		//console.log(addresses[index]);
 		(async () => {
			try {
				const data =	await etherscan.getTxList({
	     		address: addresses[index].ether,
	     		//address: '0x00',
	     		startblock: 0, // Optional
	     		endblock: 0, // Optional
	     		sort: 'asc' // Optional, default 'asc'
		 		});
				saveToDB(data, addresses[index], 0);
			} catch(err){
				console.error('Etherscan Error', addresses[index].number, index);
			}
	 })();
	 sleep(400);
	 processData (addresses, index+1);
 }
}

function saveToDB(data, address, index0){
	if (index0 == data.length){
		return
	} else {
		var value = data[index0].value/(10**18);
		if (value > 0){
			var confirmations = data[index0].confirmations;
			var hash = data[index0].hash;
			var datetime = new Date(data[index0].timeStamp*1000);
			var counterpart;
			var debit = true;
			if (data[index0].from.toUpperCase() != address.ether.toUpperCase()) {
				 debit = false;
				 value = -value;
				 counterpart = data[index0].from;
			} else {
				 counterpart = data[index0].to;
			}
			var sampleTx = new Tx({
				_id: new mongoose.Types.ObjectId(),
				number: address.number,
				owner: address.owner,
				description: address.description,
				company: address.company,
				wallet: address.wallet,
				ether: address.ether,
				counterpart: counterpart,
				timestamp: datetime,
				value: value,
				confirmations: confirmations,
				hash: hash,
				loaded: false
			});
			//console.log(sampleTx);
			(async () => {
				var promise = await getTxPromise(sampleTx);
	//			if (promise) console.log('Tx already saved:', sampleTx)
				if (!promise) sampleTx.save();
			})();
		}
		saveToDB(data, address, index0+1);
	}
}


function getTxPromise(tx){
   try {
		 var promise = mongoose.model('Tx').findOne({hash:tx.hash}).exec();
   	 return promise;
	 } catch (err) {
		 	console.log(err);
	 }
}
