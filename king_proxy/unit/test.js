const crypto = require('crypto');


const sign_pay = function (appsecret = '', params = {}) {
  let signList = ["tranid", "fid", "serverid", "packageid", "coo_order_id", "price"];
  let str = []
  for (let [key, val] of Object.entries(params)) {
    if (!signList.includes(key)) continue;
    if (val === null || val === '' || val === 'null') continue;
    str.push(key + '=' + val);
  }
  str.sort();
  str = str.join('&') + appsecret;
  console.log(str)
  return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}


function decrypt(data) {
  let cipher = crypto.createCipheriv("aes-128-cbc", "YOUR_CIPHER_KEY_", 'YOUR_CIPHER_IV__');
  let crypted = cipher.update(data, 'utf8', 'base64');
  crypted += cipher.final('base64');
  return crypted;
}

//模拟数据
let simulatedData = {
  gameid: "2000",
  sign: "46b384cd88de108268b3feae0a2ef28e",
  tranid: 2062901,
  fid: "1015624",
  serverid: 1000,
  coo_order_id: "KH15D45F034E62C19691A9AF2C07E3B36C",
  price: 129000
}

let simulatedWebsaleData = {
  sign: "8925ed54c7cd08448fd4aadc446e22db",
  gameid: "2000",
  tranid: 2062901,
  fid: "1015624",
  serverid: 1000,
  packageid: "test_009",
  items: [{
    gsid: 93307,
    count: 1
  }],
}





let yanqian = {
  sdkData: {
    "uid": "106388",
    "guest": "0",
    "linked": "0",
    "tokentype": "Bearer",
    "idtoken": "YOUR_ID_TOKEN",
    "iat": 1709784134,
    "accesstoken": "YOUR_ACCESS_TOKEN",
    "refreshtoken": "YOUR_REFRESH_TOKEN",
    "scope": "email fid-api:guest fid-api:id fid-api:profile:edit fpay-api:iap-user:create funzy-api:client offline_access openid phone profile"
  },
  gameid: "1",
  channel: 1,
  appVersion: 1,

}
// b:
//YOUR_SIGN_KEY
//YOUR_VIETNAM_KEY
let sign = sign_pay("YOUR_SIGN_KEY", simulatedData)


console.log(sign)
// a:
let data = new Buffer(JSON.stringify(simulatedWebsaleData)).toString('utf8')
let finalData = decrypt(data)

console.log("final output =====>", finalData)

//final output =====> 6COc2NvXrL60300mUtREnAUGFImmcMtF7B0IVhuElQMsQZUW/whrhfb4PUFY05RILRcceqwbzxxtxNLCnA/KsSjb91/OwDC/g1IOngBDGDs0cOxUt9isXPtg0oGZtQ5thVEs93a0EuXwrHeRNrCqnbUKb43JGbNBkhi+vaPy/RJAA//IFo2rL4swSrfJpQKKsJhHKsBMscv0clWEUMe3QMttuwnJBbTbXhABbFSRMfE=

// const run = () => new Promise((resolve, reject) => {
//   ws.send("role/xxl"), { test: "sss" }
// })
// run()
