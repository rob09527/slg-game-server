const WebSocket = require('ws');
const crypto = require('crypto');
//本地149
//var ws = new WebSocket(`wss://gametq-game9.funzy.vn:8115/?d=Z0KwEBMTGAKmFedaX%2B%2FQ1tfxw4Au5jXYDi04TM9dRuHmyWzO77rgXCw0XD4hIKGCeCd9tI2D4qYyxLzukpj6UnHkJC1ebDiVsgh6JrfiB8w%3D`);
//本地88
//var ws = new WebSocket(`ws://127.0.0.1:8101?servid=9003&uid=sdk_hunfu106286&token=robtest`);
//jx
//var ws = new WebSocket(`ws://127.0.0.1:8101?servid=1000&uid=jhl100030&token=robtest`);
// var ws = new WebSocket(`wss://gametq-game9.funzy.vn:8101?servid=1002&uid=sdk_hunfu106286&token=robtest`);
//var ws = new WebSocket(`wss://gametq-game9.funzy.vn:8101?servid=1002&uid=sdk_hunfu106286&token=robtest`);
//var ws = new WebSocket(`wss://gametq-game9.funzy.vn:8113/?d=Z0KwEBMTGAKmFedaX%2B%2FQ1rc9Lh60h%2FlbzX3g1NNB0wVLDe5EDhRwLDH4T90HJqU5gdTma%2Fyqvh%2BMPHrtzxmRnh2OXzp92WIJlX8A4rQOq7E%3D`);
//var ws = new WebSocket(`wss://127.0.0.1:8300?servid=9001&uid=9527&token=robtest`);
// var ws = new WebSocket(`ws://localhost:8300?servid=1000&uid=9527&token=robtest`);

var ws = new WebSocket(`ws://localhost:8300?servid=9000&uid=9527&token=robtest`);
//var ws = new WebSocket(`wss://gametq-game8.funzy.vn:8101/?autoReconnect=undefined&d=Z0KwEBMTGAKmFedaX%2B%2FQ1q0z8a1oj30nnHY%2F7WrxP3Zx22EMJmfrNQrF8%2BnWbUFzwulLwTLM%2BEuYTXAT6Hlxh%2BN0mlFnFeqAHS5HKfHwgMsqObnN2XoAVWLMInHIEvEK`);


//var ws = new WebSocket(`ws://localhost:8300?ser vid=1000&uid=9528&token=robtest`);
// ws.onopen = function () {
//   ws.send('hello word');
//   console.log('已连接');
// }

function decrypt(key, iv, data) {
  let cipher = crypto.createDecipheriv(algorithm, key, iv);
  let crypted = cipher.update(data, 'base64', 'utf8');
  crypted += cipher.final('utf8');
  return crypted;
}

ws.onmessage = async function (mes) {
  // 接受服务端发送的消息
  console.log("服务端信息", mes.data)
  // ws.send("role/xxl"), { test: "sss" }
}
ws.on('open', function open() {
  console.log("success")
});

ws.on('message', function incoming(data) {

});

ws.on('error', function incoming(data) {
  console.log(data);
});


ws.on('O_PUSH', function incoming(data) {
  console.log(data);
});




let data_attribute = {
  action: "API",
  data: {
    path: "role/secretRealm/csz/attribute", data: {}
  }
}

let attributeDisposable = {
  action: "API",
  data: {
    path: "role/secretRealm/csz/attributeDisposable", data: {}
  }
}

let data_ptattribute = {
  action: "API",
  data: {
    path: "role/secretRealm/csz/ptAttribute", data: { id: 2 }
  }
}

let data_czs_info = {
  action: "API",
  data: {
    path: "role/secretRealm/csz/info", data: { id: 2 }
  }
}

let data_cartokit = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/cartokit", data: { map: 100, fusion: [{ level: 1, list: [3] }] }
    // {"map":100,"fusion":[{"level":1,"list":[3]}]}}}
  }
}

let data_map = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/map", data: { mapid: 102, }
  }
}

let data_break = {
  action: "API",
  data: {
    path: "role/secretRealm/spirit/break", data: { id: 94002 }
  }
}

let data_change = {
  action: "API",
  data: {
    path: "role/secretRealm/spirit/change", data: { id: 92001 }
  }
}
//技能升级
let data_upgrade = {
  action: "API",
  data: {
    path: "role/secretRealm/spirit/upgrade", data: { id: 4202301, spiritId: 91001 }
  }
}
//技能装备
let data_setskill = {
  action: "API",
  data: {
    path: "role/secretRealm/spirit/setskill", data: { skillSequence: [4202301, 4103201, 0, 4206201] }
  }
}

let data_synthesis = {
  action: "API",
  data: {
    path: "role/secretRealm/spirit/synthesis", data: { id: 81001 }
  }
}
let data_info = {
  action: "API",
  data: {
    path: "role/secretRealm/info", data: { id: 91001, }
  }
}



let data_gather = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/gather", data: { list: [{ type: 1, num: 1 }] }
  }
}


let data_boss = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/boss", data: { id: 10205 }
  }
}

let data_mj_unlock = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/unlock", data: { mapid: 100, level: 2 }
  }
}


let data_tc = {
  action: "API",
  data: {
    path: "common/pop", data: {}
  }
}

let data_wdjz_attacked = {
  action: "API",
  data: {
    path: "role/secretRealm/fight/attackered", data: { list: [{ type: 1, num: 50 }] }
  }
}
// 667bd7b050176c0aa0591cff
//664f00235c9bd5aac7c1d1b3
//battlearr
let data_wdjz_attacked_start = {
  action: "API",
  data: {
    path: "role/secretRealm/fight/start", data: { target: "664f00235c9bd5aac7c1d1b3" }
  }
}

let data_wdjz_getattacked = {
  action: "API",
  data: {
    path: "role/secretRealm/fight/getAttackered", data: {}
  }
}

let data_wdjz_attacked_finish = {
  action: "API",
  data: {
    path: "role/secretRealm/fight/finish", data: { battleid: "67ad6090bc6186127388129b" }
  }
}

let data_wdjz_task_reward = {
  action: "API",
  data: {
    path: "role/secretRealm/task/reward", data: {}
  }
}
let data_wdjz_task_kill = {
  action: "API",
  data: {
    path: "role/secretRealm/task/kill", data: { typeparams: 1 - 2 - 3, count: 5 }
  }
}


let data_wdjz_task_info = {
  action: "API",
  data: {
    path: "role/secretRealm/task/info", data: {}
  }
}

let video = {
  action: "API",
  data: {
    path: "role/video/secretpvp/get", data: { num: 10, mark: "secretpvp" }
  }
}

let data_wdjz_attacked_rid = {
  action: "API",
  data: {
    path: "role/secretRealm/fight/player", data: { rid: "664f00235c9bd5aac7c1d1b3" }
  }
}
//天牢解锁座位
let data_tianlao_unlock = {
  action: "API",
  data: {
    path: "role/official/srender/seat/unlock", data: { id: 2 }
  }
}

// 天牢入狱操作
let data_tianlao_imprisonment = {
  action: "API",
  data: {
    path: "role/official/srender/general/imprisonment", data: { id: "67bd2f29764d2f0bba7c7962" }
  }
}
//查看列表
let data_tianlao_chazhao = {
  action: "API",
  data: {
    path: "role/official/srender/search/list", data: {}
  }
}
//前往 一定要收到success才可以进行start 不然数据不通过
let data_tianlao_destined = {
  action: "API",
  data: {
    path: "role/official/srender/search/destined", data: { rid: '6687c3fd7d504e45e1f5f10c' }
  }
}
let data_tianlao_config = {
  action: "API",
  data: {
    path: "role/official/srender/search/config", data: {}
  }
}
//开始
//id 武将唯一id
let data_tianlao_start = {
  action: "API",
  data: {
    path: "role/official/srender/general/start", data: { id: '67bd2f29764d2f0bba7c7886' }
  }
}

let data_tianlao_finish = {
  action: "API",
  data: {
    path: "role/official/srender/general/finish", data: { id: '67b5931e64af035913c3d521', battleid: "67b6fc68bcb02d3ff2fde6af" }
  }
}

let data_tianlao_revice = {
  action: "API",
  data: {
    path: "role/official/srender/general/revive", data: { id: '67b5931e64af035913c3d521' }
  }
}

let data_tianlao_claimstatus = {
  action: "API",
  data: {
    path: "role/official/srender/general/claims", data: { id: '67c56a6a974d5504e7065a0d', win: true }
  }
}

let data_tianlao_info = {
  action: "API",
  data: {
    path: "role/official/srender/search/info", data: {}
  }
}
let data_tianlao_spy = {
  action: "API",
  data: {
    path: "role/official/srender/search/spy", data: { rid: "664f00235c9bd5aac7c1d1b3" }
  }
}

let c = { "team": { "3": "6687a12f45888d1a82974cee", "5": "6687532375ace9e819fd3bd9", "10": "6687a13a45888d1a82974cf3", "15": "6687a12545888d1a82974ce8", "17": "6769252fd9f61b1e43ad8159", "19": "6687a11f45888d1a82974ce4" }, "mythic": "101", "zhenfa": 102, "tname": "编队0" }

let data_tianlao_battlearr = {
  action: "API",
  data: {
    path: "role/official/srender/battlearr/set", data: { battleset: c }
  }
}

let data_tianlao_record = {
  action: "API",
  data: {
    path: "role/official/srender/search/record", data: {}
  }
}
let data_test = {
  action: "API",
  data: {
    path: "dev/test", data: { id: '67b56fedfb2ca52f6fa5f4a9' }
  }

}
//领取boss任务
let data_exid = {
  action: "API",
  data: {
    path: "role/exec", data: { exid: 'daily_boss_0' }
  }
}
//领取积分任务
let data_exidpoint = {
  action: "API",
  data: {
    path: "role/exec", data: { exid: 'achieve_point_20' }
  }
}


//查看当前任务进行到第几关了
let data_secretRealmaddtask = {
  action: "API",
  data: {
    path: "role/secretRealm/addtask/info", data: {}
  }
}
//解锁地图消耗
let data_secretteleport = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/teleport", data: { mapid: 100, index: 'tp_1_0' }
  }
}
let data_delecool = {
  action: "API",
  data: {
    path: "role/manor/build/cooling", data: { "bid": 8 }
  }
}

let data_unlock = {
  action: "API",
  data: {
    path: "role/manor/build/unlock", data: { "bid": 1 }
  }
}

let data_serecordboss = {
  action: "API",
  data: {
    path: "role/secretRealm/gz/recordboss", data: { bossid: 12301 }
  }
}

let data_login = {
  action: "API",
  data: {
    path: "dev/login", data: {
      uid: 'test_1004_',
      servid: 1004,
    }
  }

}
let data_rank = {
  action: "API",
  data: { path: "role/rank/get", data: { uid: "9629", rank: "pushmap" } }
}

//攀爬 激活 两个功能一个接口
let data_ssdb = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/shin", data: { pay: true, act: true }
  }
}
//攀爬奖励领取  领取过后游戏结束
let data_ssdbclaim = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/claim", data: { index: 1 }
  }
}
//配置获取
let data_ssdbconfig = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/config", data: { index: 1 }
  }
}
//神树配置
let data_ssdbinfo = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/info", data: { bossid: 12301 }
  }
}

//神树礼包购买配置
//rmd pid='ssdb_3' 
let data_ssdbgift = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/gift/buy", data: { id: 3, platform: 1, bundle: 1, channel: 1, version: 1, }
  }
}

let data_ssdbgiftreceive = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/gift/receive", data: { id: 1, }
  }
}

//地图开箱子
let data_ssdbbox = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/box/claim", data: { index: 3 }
  }
}

let data_ssdbach = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/ach/claim", data: { cnum: 50 }
  }
}
//通行证购买
let data_ssdbgifttxz = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/txz/buy", data: { platform: 1, bundle: 1, channel: 1, version: 1, }
  }
}

//通行证领取
let data_ssdbtxzreceive = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/txz/receive", data: { day: 2, vip: false }
  }
}


//商店兑换领取
let data_ssdbtxzshop = {
  action: "API",
  data: {
    path: "role/secretRealm/ssdb/shop/exchange", data: { pos: 3 }
  }
}




setInterval(() => {
  console.log("====数据来到")

  // video
  //data_wdjz_attacked_start
  //data_wdjz_attacked_fi67b6fc68bcb02d3ff2fde6afnish
  ws.send(JSON.stringify(data_ssdbtxzshop))
  // ws.send(JSON.stringify(data_tianlao_battlearr))
  //ws.send(JSON.stringify(data_tianlao_info))
  // ws.send(JSON.stringify(data_tianlao_record))
  //ws.send(JSON.stringify(data_tianlao_chazhao))
  //ws.send(JSON.stringify(data_tianlao_qianwang))
  // ws.send(JSON.stringify(data_delecool))
  //ws.send(JSON.stringify(data_tianlao_info))
  //ws.send(JSON.stringify(data_tianlao_config))

}, 1000 * 3);









