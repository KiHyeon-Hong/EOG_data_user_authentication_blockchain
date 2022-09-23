const request = require('request');
const fs = require('fs');

const contract_address = fs.readFileSync(__dirname + '/files/contract_address.txt', 'utf8');
const user_id = fs.readFileSync(__dirname + '/files/user_id.txt', 'utf8');
const fp1 = '/user1/file1-1.txt';
const fp2 = '/user1/file1-2.txt';

const options = {
  uri: `http://localhost:65005/serviceRegistration?fp1=${fp1}&fp2=${fp2}&contract=${contract_address}&id=${user_id}`,
  method: 'GET',
};

request.get(options, function (error, response, body) {
  console.log(body);
});
