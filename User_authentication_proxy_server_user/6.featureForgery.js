const request = require('request');
const fs = require('fs');

const user_public = fs.readFileSync(__dirname + '/files/user_public.txt', 'utf8');
const user_private = fs.readFileSync(__dirname + '/files/user_private.txt', 'utf8');
const contract_address = fs.readFileSync(__dirname + '/files/contract_address.txt', 'utf8');

const options = {
  uri: `http://localhost:65001/featureForgery?public=${user_public}&private=${user_private}&contract=${contract_address}`,
  method: 'GET',
};

request.get(options, function (error, response, body) {
  console.log(body);
});
