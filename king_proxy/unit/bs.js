// console.log('====', data)
// let clientdata = JSON.parse(data)
// if (clientdata.action == "GENERALS") {
// /api/role/xxl
// let data = {
//   action: "API",
//   data: { path: "role/event/mjxxl/info", data: { uid: "9527" } }
// }

// let data_score = {
//   action: "API",
//   data: { path: "role/event/mjxxl/score", data: { uid: "9527", score: 5000 } }
// }
// let data_buy = {
//   action: "API",
//   data: { path: "role/event/mjxxl/buy", data: { uid: "9527" } }
// }

// let data_task = {
//   action: "API",
//   data: { path: "role/event/mjxxl/task", data: { uid: "9527", index: 90596 } }
// }
// let data_box = {
//   action: "API",
//   data: { path: "role/event/mjxxl/box", data: { uid: "9527", index: 3 } }
// }



// let data_rank = {
//   action: "API",
//   data: { path: "role/rank/get", data: { uid: "9629", rank: "xhycz" } }
// }

// let data_rank_topup = {
//   action: "API",
//   data: { path: "role/rank/get", data: { uid: "9629", rank: "xhycz" } }
// }



// console.log('====', data)
// ws.send(JSON.stringify(data_huodong))
// console.log(decrypt({ "ss": "data" }))


// setInterval(() => {
//   ws.send(JSON.stringify(data_buy))
// }, 5000);

// setInterval(() => {
//   ws.send(JSON.stringify(data_box))
// }, 3000);

// }

//策划配置访问。 数据结构一比一还原 
let data_info = {
    action: "API",
    data: { path: "role/event/ftmphb/info", data: {} }
}
//分数汇报    uid 忽略 是服务器测试使用
let data_ftm_score = {
    action: "API",
    data: { path: "role/event/ftmphb/score", data: { uid: "9527", score: 9000 } }
}
let data_ftm_userinfo = {
    action: "API",
    data: { path: "role/event/ftmphb/userinfo", data: {} }
}

//排行榜获取 rank:1 活动全局排行榜 rank:2 是每日排行榜数据   uid 忽略 是服务器测试使用
let data_ftm_rank = {
    action: "API",
    data: { path: "role/event/ftmphb/rank", data: { uid: "testrole99118", rank: 1 } }
}
let data_ftm_reward = {
    action: "API",
    data: { path: "role/event/ftmphb/reward", data: { uid: "jhl2", price: 648 } }
}
console.log("===kaishi")

let data_pandas = {
    action: "API",
    data: { path: "role/zhdroutine/endtime/get", data: { uid: "sdk_hunfu4135", index: 1 } }
}

let data_cjzm_info = {
    action: "API",
    data: { path: "role/event/cjzm/info", data: { index: -1 } }
}

let data_cjzm_carddraw = {
    action: "API",
    data: { path: "role/event/cjzm/carddraw", data: { multiple: 3 } }
}

let data_cjzm_config = {
    action: "API",
    data: { path: "role/event/cjzm/config", data: {} }
}


let data_cjzm_quit = {
    action: "API",
    data: { path: "role/event/cjzm/quit", data: {} }
}
let data_panda = {
    action: "API",
    data: { path: "role/zhdroutine/endtime/get", data: { uid: "9527", index: 50 } }
}

//商业化所有信息查看处
let data_cjzmsyh_info = {
    action: "API",
    data: { path: "role/event/cjzmsyh/info", data: {} }
}
let data_cjzmsyh_lunckly_receive = {
    action: "API",
    data: { path: "role/event/cjzmsyh/lucky/receive", data: { index: 5 } }
}

let data_cjzmsyh_config = {
    action: "API",
    data: { path: "role/event/cjzmsyh/config", data: {} }
}

let data_cjzmsyh_txz = {
    action: "API",
    data: { path: "role/event/cjzmsyh/txz/receive", data: { index: 10 } }
}

let data_cjzmsyh_cjlb_buy = {
    action: "API",
    data: { path: "role/event/cjzmsyh/cjzmlb/buy", data: { index: 1 } }
}
// platform, bundle, channel, version
let data_cjzmsyh_txz_buy = {
    action: "API",
    data: { path: "role/event/cjzmsyh/txz/buy", data: {} }
}
//mb yl jjd //鱼露 猫币 进阶丹  
let data_cjzmsyh_lglb_yl_buy = {
    action: "API",
    data: { path: "role/event/cjzmsyh/lglb/buy", data: { type: "yl", index: 1 } }
}
let data_cjzmsyh_lglb_yl_receive = {
    action: "API",
    data: { path: "role/event/cjzmsyh/lglb/receive", data: { index: 60 } }
}

let data_cjzmsyh_lglb_yl_shopbuy = {
    action: "API",
    data: { path: "role/event/cjzmsyh/lglb/shopbuy", data: { type: "yl", index: 1 } }
}
let data_pvp_start = {
    action: "API",
    data: {
        path: "role/pvpmultiplayer/challenge/start", data: {
            // 6655832d76fd9e6e0b77f264
            //6687c3fd7d504e45e1f5f10c
            //robot_1001
            target: '6687c4414950d81933c7914f',

        }
    }
}