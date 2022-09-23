const request = require('request');
const fs = require('fs');

const user_id = fs.readFileSync(__dirname + '/files/user_id.txt', 'utf8');
const fp1 = '/user1/file2-1.txt';
const fp2 = '/user1/file2-2.txt';

const options = {
  uri: `http://localhost:65005/serviceAuthentication?fp1=${fp1}&fp2=${fp2}&id=${user_id}`,
  method: 'GET',
};

request.get(options, function (error, response, body) {
  console.log(body);
});
