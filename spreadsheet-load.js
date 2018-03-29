var mongoose = require('mongoose');
var Tx = require('./tx');
var sleep = require('system-sleep');

var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1UZBzZ2mFKxZ6M7pDqOue-uLh-9V2gAN8zKMUvsSg9xY');

// Authenticate with the Google Spreadsheets API.
doc.useServiceAccountAuth(creds, function (err) {

  // Get all of the rows from the spreadsheet.
/*  doc.getRows(1, function (err, rows) {
    console.log(rows.length);
    console.log(rows);
  });*/
});

mongoose.connect('mongodb://localhost/mongoose_basics', function (err) {
	if (err) console.log(err);
	console.log('Successfully connected');
});

(async () => {
  var promise = await getTxesPromise();
  loadToSS(promise, 0);
 })();

 function getTxesPromise(){
    try {
 		 var promise = mongoose.model('Tx').find({loaded:false}).exec();
    	 return promise;
 	 } catch (err) {
 		 	console.log(err);
 	 }
 }

 function loadToSS(txes, index){
   if (index == txes.length){
 		mongoose.connection.close();
 		return;
 	}
 	else{
		sleep(500);
  		(async () => {
        try {
          var harvest ={
              number: txes[index].number,
              owner: txes[index].owner,
              description: txes[index].description,
              company: txes[index].company,
              wallet: txes[index].wallet,
              ether: txes[index].ether,
              counterpart: txes[index].counterpart,
              timestamp: txes[index].timestamp,
              value: txes[index].value,
              confirmations: txes[index].confirmations,
              hash: txes[index].hash
          };
          doc.addRow(1, harvest, function(err) {
            if(err) {
              console.log(err);
            }
          });
          txes[index].loaded = true;
          txes[index].save();
   	  sleep(500);
     	 } catch (err) {
     		 	console.log(err);
     	 }
 	 })();
 	 loadToSS (txes, index+1);
  }
 }
