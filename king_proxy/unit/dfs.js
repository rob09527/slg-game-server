const WebSocket = require('ws');
const crypto = require('crypto');
var ws = new WebSocket(`ws://localhost:8300?servid=1000&uid=9629&token=robtest`);


function decrypt(key, iv, data) {
  let cipher = crypto.createDecipheriv(algorithm, key, iv);
  let crypted = cipher.update(data, 'base64', 'utf8');
  crypted += cipher.final('utf8');
  return crypted;
}

ws.onmessage = async function (mes) {
  // 接受服务端发送的消息
  console.log(mes.data, { servid: 9001 })
  console.log("====")
}

ws.on('open', function open() {
  console.log("success")
});

ws.on('message', function incoming(data) {
  let clientdata = JSON.parse(data)
  if (clientdata.action == "GENERALS") {


    let data_service_create = {
      action: "API",
      data: { path: "dev/service/create", data: { uid: "9629", rank: "xhycz", } }
    }
    let data_testrole_create = {
      action: "API",
      //1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009
      data: { path: "dev/testrole/create", data: { servers: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009], usernum: 90, type: 3 } }
    }
    let data_testrole_pvp = {
      action: "API",
      data: { path: "dev/topkingpvp/testrole", data: { servers: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009], usernum: 50, type: 1 } }
    }

    let data_testrole_pvp_service = {
      action: "API",
      data: { path: "dev/topkingpvp/testrolebattle", data: { servers: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009], usernum: 50, type: 1 } }
    }


    let data_testrole_pvp_againchallenge = {
      action: "API",
      data: { path: "dev/topkingpvp/againchallenge", data: { servers: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009], usernum: 50, type: 3 } }
    }



    //创建服务器
    // ws.send(JSON.stringify(data_service_create))
    //创建角色
    ws.send(JSON.stringify(data_testrole_create))
    //插入测试数据
    // ws.send(JSON.stringify(data_testrole_pvp))
    // ws.send(JSON.stringify(data_testrole_pvp_service))
    //ws.send(JSON.stringify(data_testrole_pvp_againchallenge))

    // setInterval(() => {
    //   ws.send(JSON.stringify(data_rank_topup))
    // }, 10000);
  }

});

ws.on('error', function incoming(data) {
  console.log(data);
});


ws.on('O_PUSH', function incoming(data) {
  console.log(data);
});



