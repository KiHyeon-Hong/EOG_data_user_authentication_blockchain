const IPFS = require('ipfs-api');
const Web3 = require('web3');
const fs = require('fs');

const bodyParser = require('body-parser');
const request = require('request');

const express = require('express');
const app = express();

const userRegistration = require(__dirname + '/src/register.js');
const userIdentification = require(__dirname + '/src/identification.js');

const abi = JSON.parse(fs.readFileSync(__dirname + '/files/ABI.json', 'utf8'));
const bytecode = fs.readFileSync(__dirname + '/files/bytecode.txt', 'utf8');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const ipfs = new IPFS({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
});

const ipfs_upload = (data) => {
  return new Promise((resolve, reject) => {
    const fileBuffer = new Buffer.from(data);

    ipfs.files.add(fileBuffer, (err, f) => {
      resolve(f[0].path);
    });
  });
};

const ipfs_download = (path) => {
  return new Promise((resolve, reject) => {
    ipfs.files.get(path, (err, ff) => {
      resolve(ff[0].content.toString());
    });
  });
};

const deploy_contract = (user_public, fp1_path, fp2_path, registrationResult) => {
  const from = user_public;
  const IdentificationContract = new web3.eth.Contract(abi);

  return new Promise((resolve, reject) => {
    const EOG_Identification = IdentificationContract.deploy({
      data: bytecode,
      arguments: [
        [
          registrationResult[0].HP.toString(),
          registrationResult[0].LP.toString(),
          registrationResult[0].LHPL.toString(),
          registrationResult[0].LLPL.toString(),
          registrationResult[0].HPL.toString(),
          registrationResult[0].LPL.toString(),
          registrationResult[0].LHPG.toString(),
          registrationResult[0].LLPG.toString(),
          registrationResult[0].RHPG.toString(),
          registrationResult[0].RLPG.toString(),
          registrationResult[0].blink.toString(),
          registrationResult[0].notBlink.toString(),
          registrationResult[1].HP.toString(),
          registrationResult[1].LP.toString(),
          registrationResult[1].LHPL.toString(),
          registrationResult[1].LLPL.toString(),
          registrationResult[1].HPL.toString(),
          registrationResult[1].LPL.toString(),
          registrationResult[1].LHPG.toString(),
          registrationResult[1].LLPG.toString(),
          registrationResult[1].RHPG.toString(),
          registrationResult[1].RLPG.toString(),
          registrationResult[1].blink.toString(),
          registrationResult[1].notBlink.toString(),
        ],
        [fp1_path, fp2_path],
      ],
    })
      .send(
        {
          from: from,
          gas: '4700000',
        },
        function (err, contract) {
          console.log(contract);
        }
      )
      .then(function (newContractInstance) {
        console.log(newContractInstance.options.address); // instance with the new contract address
        resolve(newContractInstance.options.address);
      });
  });
};

const feature_search = async (contract_address) => {
  const CA = contract_address;
  const ABI = abi;

  const Contract = new web3.eth.Contract(ABI, CA);

  let feature = await Contract.methods.getFeature().call();
  return feature;
};

const path_search = async (contract_address) => {
  const CA = contract_address;
  const ABI = abi;

  const Contract = new web3.eth.Contract(ABI, CA);

  let path = await Contract.methods.getPath().call();
  return path;
};

const set_contract = async (contract_address, user_public, user_private, registrationResult) => {
  const CA = contract_address;
  const from = user_public;
  const pk = user_private;
  const ABI = abi;

  // 스마트 콘트랙트 객체 생성
  let Contract = new web3.eth.Contract(ABI, CA);

  // 스마트 콘트랙트에 정의한 함수 실행
  let bytedata = await Contract.methods
    .setFeature([
      registrationResult[0].HP.toString(),
      registrationResult[0].LP.toString(),
      registrationResult[0].LHPL.toString(),
      registrationResult[0].LLPL.toString(),
      registrationResult[0].HPL.toString(),
      registrationResult[0].LPL.toString(),
      registrationResult[0].LHPG.toString(),
      registrationResult[0].LLPG.toString(),
      registrationResult[0].RHPG.toString(),
      registrationResult[0].RLPG.toString(),
      registrationResult[0].blink.toString(),
      registrationResult[0].notBlink.toString(),
      registrationResult[1].HP.toString(),
      registrationResult[1].LP.toString(),
      registrationResult[1].LHPL.toString(),
      registrationResult[1].LLPL.toString(),
      registrationResult[1].HPL.toString(),
      registrationResult[1].LPL.toString(),
      registrationResult[1].LHPG.toString(),
      registrationResult[1].LLPG.toString(),
      registrationResult[1].RHPG.toString(),
      registrationResult[1].RLPG.toString(),
      registrationResult[1].blink.toString(),
      registrationResult[1].notBlink.toString(),
    ])
    .encodeABI();

  const tx = {
    from,
    to: CA,
    gas: 1000000,
    gasPrice: '21000000000',
    data: bytedata,
  };

  const account = web3.eth.accounts.privateKeyToAccount(pk);
  const signedTx = await account.signTransaction(tx);
  const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);

  return sentTx;
};

app.get('/userRegistration', async (req, res, next) => {
  let fp1 = fs.readFileSync(__dirname + `/data${req.query.fp1}`, 'utf8');
  let fp2 = fs.readFileSync(__dirname + `/data${req.query.fp2}`, 'utf8');
  let user_public = req.query.public;

  let registrationResult = userRegistration.register(fp1, fp2);

  let fp1_path = await ipfs_upload(fp1);
  let fp2_path = await ipfs_upload(fp2);

  let contract_address = await deploy_contract(user_public, fp1_path, fp2_path, registrationResult);

  res.send(`${contract_address}`);
});

app.get('/userAuthentication', async (req, res, next) => {
  let fp1 = fs.readFileSync(__dirname + `/data${req.query.fp1}`, 'utf8');
  let fp2 = fs.readFileSync(__dirname + `/data${req.query.fp2}`, 'utf8');

  // 사용자의 스마트 컨트랙트 주소
  let contract_address = req.query.contract;

  let userFeature = await feature_search(contract_address);

  let identificationResult = userIdentification.identification(fp1, fp2, userFeature);
  console.log(identificationResult);

  res.send(`${identificationResult}`);
});

app.get('/integrityVerification', async (req, res, next) => {
  // 사용자의 스마트 컨트랙트 주소
  let contract_address = req.query.contract;
  let user_public = req.query.public;
  let user_private = req.query.private;

  let userFeature = await feature_search(contract_address);
  let path = await path_search(contract_address);

  let fp1 = await ipfs_download(path[0]);
  let fp2 = await ipfs_download(path[1]);

  let registrationResult = userRegistration.register(fp1, fp2);
  let reliableFeature = [
    registrationResult[0].HP.toString(),
    registrationResult[0].LP.toString(),
    registrationResult[0].LHPL.toString(),
    registrationResult[0].LLPL.toString(),
    registrationResult[0].HPL.toString(),
    registrationResult[0].LPL.toString(),
    registrationResult[0].LHPG.toString(),
    registrationResult[0].LLPG.toString(),
    registrationResult[0].RHPG.toString(),
    registrationResult[0].RLPG.toString(),
    registrationResult[0].blink.toString(),
    registrationResult[0].notBlink.toString(),
    registrationResult[1].HP.toString(),
    registrationResult[1].LP.toString(),
    registrationResult[1].LHPL.toString(),
    registrationResult[1].LLPL.toString(),
    registrationResult[1].HPL.toString(),
    registrationResult[1].LPL.toString(),
    registrationResult[1].LHPG.toString(),
    registrationResult[1].LLPG.toString(),
    registrationResult[1].RHPG.toString(),
    registrationResult[1].RLPG.toString(),
    registrationResult[1].blink.toString(),
    registrationResult[1].notBlink.toString(),
  ];

  let check = true;
  for (let i = 0; i < userFeature.length; i++) if (userFeature[i] !== reliableFeature[i]) check = false;

  if (!check) {
    let setResult = await set_contract(contract_address, user_public, user_private, registrationResult);
    console.log(setResult);
  }

  res.send(`${check}`);
});

app.get('/featureForgery', async (req, res, next) => {
  // 사용자의 스마트 컨트랙트 주소
  let contract_address = req.query.contract;
  let user_public = req.query.public;
  let user_private = req.query.private;

  let path = await path_search(contract_address);

  let fp1 = await ipfs_download(path[0]);
  let fp2 = await ipfs_download(path[1]);

  let registrationResult = userRegistration.register(fp1, fp2);

  registrationResult[0].HP = registrationResult[0].HP + 10;
  registrationResult[0].LP = registrationResult[0].LP + 10;
  registrationResult[0].LHPL = registrationResult[0].LHPL + 10;
  registrationResult[0].LLPL = registrationResult[0].LLPL + 10;
  registrationResult[0].HPL = registrationResult[0].HPL + 10;
  registrationResult[0].LPL = registrationResult[0].LPL + 10;
  registrationResult[0].LHPG = registrationResult[0].LHPG + 10;
  registrationResult[0].LLPG = registrationResult[0].LLPG + 10;
  registrationResult[0].RHPG = registrationResult[0].RHPG + 10;
  registrationResult[0].RLPG = registrationResult[0].RLPG + 10;
  registrationResult[0].blink = registrationResult[0].blink + 10;
  registrationResult[0].notBlink = registrationResult[0].notBlink + 10;
  registrationResult[1].HP = registrationResult[1].HP + 10;
  registrationResult[1].LP = registrationResult[1].LP + 10;
  registrationResult[1].LHPL = registrationResult[1].LHPL + 10;
  registrationResult[1].LLPL = registrationResult[1].LLPL + 10;
  registrationResult[1].HPL = registrationResult[1].HPL + 10;
  registrationResult[1].LPL = registrationResult[1].LPL + 10;
  registrationResult[1].LHPG = registrationResult[1].LHPG + 10;
  registrationResult[1].LLPG = registrationResult[1].LLPG + 10;
  registrationResult[1].RHPG = registrationResult[1].RHPG + 10;
  registrationResult[1].RLPG = registrationResult[1].RLPG + 10;
  registrationResult[1].blink = registrationResult[1].blink + 10;
  registrationResult[1].notBlink = registrationResult[1].notBlink + 10;

  let setResult = await set_contract(contract_address, user_public, user_private, registrationResult);

  res.send(`Forgery!`);
});

app.listen(65001, () => {
  console.log(`생체 데이터 기반의 사용자 인증 NFT 프록시 서버 동작 중......`);
});
