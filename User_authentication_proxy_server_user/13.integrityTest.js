const request = require('request');
const fs = require('fs');

const user_public = fs.readFileSync(__dirname + '/files/user_public.txt', 'utf8');
const user_private = fs.readFileSync(__dirname + '/files/user_private.txt', 'utf8');

fs.writeFileSync(__dirname + '/logs/BadIntegrityTest.csv', 'Count,Integrity,Time\n', 'utf8');
fs.writeFileSync(__dirname + '/logs/GoodIntegrityTest.csv', 'Count,Integrity,Time\n', 'utf8');

let total = 1000;

const registationFunc = () => {
  return new Promise((resolve, reject) => {
    const fp1 = `/user1/file0-1.txt`;
    const fp2 = `/user1/file0-2.txt`;

    const options = {
      uri: `http://localhost:65001/userRegistration?fp1=${fp1}&fp2=${fp2}&public=${user_public}`,
      method: 'GET',
    };

    request.get(options, function (error, response, body) {
      fs.writeFileSync(__dirname + '/files/contract_address.txt', body + '\n', 'utf8');
      resolve(body);
    });
  });
};

const forgeryFunc = () => {
  const contract_address = fs.readFileSync(__dirname + '/files/contract_address.txt', 'utf8');

  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://localhost:65001/featureForgery?public=${user_public}&private=${user_private}&contract=${contract_address}`,
      method: 'GET',
    };

    request.get(options, function (error, response, body) {
      resolve(body);
    });
  });
};

const integrityFunc = () => {
  const contract_address = fs.readFileSync(__dirname + '/files/contract_address.txt', 'utf8');

  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://localhost:65001/integrityVerification?public=${user_public}&private=${user_private}&contract=${contract_address}`,
      method: 'GET',
    };

    const start = new Date();
    request.get(options, function (error, response, body) {
      console.log(body);
      resolve([body, new Date() - start]);
    });
  });
};

const main = async () => {
  console.log(await registationFunc());

  for (let i = 0; i < total; i++) {
    console.log(await forgeryFunc());

    let result = await integrityFunc();
    fs.appendFileSync(__dirname + '/logs/BadIntegrityTest.csv', `${i},${result[0]},${result[1]}\n`, 'utf8');
    console.log(i, result[0], result[1]);

    result = await integrityFunc();
    fs.appendFileSync(__dirname + '/logs/GoodIntegrityTest.csv', `${i},${result[0]},${result[1]}\n`, 'utf8');
    console.log(i, result[0], result[1]);
  }
};

main();
