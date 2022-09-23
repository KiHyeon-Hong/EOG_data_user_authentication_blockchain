const fs = require('fs');

const bodyParser = require('body-parser');
const request = require('request');

const express = require('express');
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/serviceRegistration', async (req, res, next) => {
  let fp1 = req.query.fp1;
  let fp2 = req.query.fp2;
  let contract_address = req.query.contract;
  let user_id = req.query.id;

  const options = {
    uri: `http://localhost:65001/userAuthentication?fp1=${fp1}&fp2=${fp2}&contract=${contract_address}`,
    method: 'GET',
  };

  request.get(options, function (error, response, body) {
    if (body === 'true') {
      fs.appendFileSync(__dirname + '/files/user_information.txt', `${user_id},${contract_address}\n`, 'utf8');
      res.send('Success!');
    } else {
      res.send('Fail!');
    }
  });
});

app.get('/serviceAuthentication', async (req, res, next) => {
  let fp1 = req.query.fp1;
  let fp2 = req.query.fp2;
  let user_id = req.query.id;

  let contract_address = fs
    .readFileSync(__dirname + '/files/user_information.txt', 'utf8')
    .split('\n')
    .map((v) => {
      return v.split(',');
    })
    .filter((v) => {
      return v[0] === user_id;
    })[0][1];

  const options = {
    uri: `http://localhost:65001/userAuthentication?fp1=${fp1}&fp2=${fp2}&contract=${contract_address}`,
    method: 'GET',
  };

  request.get(options, function (error, response, body) {
    if (body === 'true') {
      res.send('Success!');
    } else {
      res.send('Fail!');
    }
  });
});

app.get('/', async (req, res, next) => {});

app.listen(65005, () => {
  fs.writeFileSync(__dirname + '/files/user_information.txt', '', 'utf8');
  console.log(`서비스 제공 업체 서버 동작 중......`);
});
