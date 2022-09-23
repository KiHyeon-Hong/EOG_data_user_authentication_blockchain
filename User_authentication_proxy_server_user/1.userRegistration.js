const request = require('request');
const fs = require('fs');

const user_public = fs.readFileSync(__dirname + '/files/user_public.txt', 'utf8');
const fp1 = '/user1/file0-1.txt';
const fp2 = '/user1/file0-2.txt';

const options = {
  uri: `http://localhost:65001/userRegistration?fp1=${fp1}&fp2=${fp2}&public=${user_public}`,
  method: 'GET',
};

request.get(options, function (error, response, body) {
  console.log(body);
  fs.writeFileSync(__dirname + '/files/contract_address.txt', body, 'utf8');
});
