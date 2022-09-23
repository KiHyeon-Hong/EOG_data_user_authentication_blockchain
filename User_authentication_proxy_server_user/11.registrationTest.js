const request = require('request');
const fs = require('fs');

const user_public = fs.readFileSync(__dirname + '/files/user_public.txt', 'utf8');
fs.writeFileSync(__dirname + '/files/contract_address_total.txt', '', 'utf8');
fs.writeFileSync(__dirname + '/logs/RegistrationTest.csv', 'Count,Time\n', 'utf8');

let total = 1000;

const registationFunc = () => {
  return new Promise((resolve, reject) => {
    const fp1 = `/user1/file0-1.txt`;
    const fp2 = `/user1/file0-2.txt`;

    const options = {
      uri: `http://localhost:65001/userRegistration?fp1=${fp1}&fp2=${fp2}&public=${user_public}`,
      method: 'GET',
    };

    const start = new Date();
    request.get(options, function (error, response, body) {
      console.log(body);
      fs.appendFileSync(__dirname + '/files/contract_address_total.txt', body + '\n', 'utf8');
      resolve(new Date() - start);
    });
  });
};

const main = async () => {
  for (let i = 0; i < total; i++) {
    let result = await registationFunc();
    fs.appendFileSync(__dirname + '/logs/RegistrationTest.csv', `${i},${result}\n`, 'utf8');

    console.log(i, result);
  }
};

main();
