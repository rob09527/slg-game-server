'use strict'
// const assert = require('assert');

// 审核包
const version = async function () {
    const version = await global.dao.iosversion.find({ status: 1 }).sort({ _id: -1 });
    global.CACHE.version = [];
    for (let v of version) {
        global.CACHE.version.push({
            gameid: v.gameid,
            version: +v.version
        })
    }
}

// 热更新
const hotupd = async function () {
    let hotupd = await global.dao.hotupd.find().sort({ _id: -1 });
    global.CACHE.hotupd = { list: [], white: {} };
    for (let v of hotupd) {
        if (v.status < 0) {
            global.CACHE.hotupd.white = v;
        }
        else {
            global.CACHE.hotupd.list.push(v);
        }
    }
}
//强制更新
const qzupd = async function () {
    let qzupd = await global.dao.qzupd.find().sort({ _id: -1 });
    global.CACHE.qzupd = { list: [], white: {} };
    for (let v of qzupd) {
        if (v.status < 0) {
            global.CACHE.qzupd.white = v;
        }
        else {
            global.CACHE.qzupd.list.push(v);
        }
    }
    console.log("强制更新数据", global.CACHE.qzupd)
}


// 渠道
const channel = async function () {
    let channel = await global.dao.channel.find().sort({ _id: -1 });
    global.CACHE.channel = {};
    for (let v of channel) {
        global.CACHE.channel[v.gameid] = v;
    }
}

// 公告
const notice = async function () {
    let notice = await global.dao.notice.find().sort({ _id: -1 });
    global.CACHE.notice = [];
    for (let v of notice) {
        global.CACHE.notice.push(v);
    }
}

// 维护
const maintain = async function () {
    let maintain = await global.dao.maintain.find({ type: { $exists: 1 } }).sort({ _id: -1 });
    global.CACHE.maintain = [];
    for (let v of maintain) {
        global.CACHE.maintain[v.type] = v;
    }
}

// 白名单
const whitelist = async function () {
    let whitelist = await global.dao.whitelist.find().sort({ _id: -1 });
    global.CACHE.whitelist = {};
    for (let v of whitelist) {
        global.CACHE.whitelist[v.uid] = v.create;
    }
}

// 封号
const ban = async function () {
    let ban = await global.dao.ban.find().sort({ _id: -1 });
    global.CACHE.ban = {}
    for (let v of ban) {
        global.CACHE.ban[v.uid] = v.expired;
    }
}

// 服务器列表
const gameserver = async function () {
    let gameserver = await global.dao.gameserver.find().sort({ _id: -1 });
    global.CACHE.gameserver = { list: {}, normal: {}, verify: {}, opentime: [0, 0] };
    for (let v of gameserver) {
        if (v.type == 1) {
            global.CACHE.gameserver.verify[v.servid] = v;
            if (global.CACHE.gameserver.opentime[1] == 0 || global.CACHE.gameserver.opentime[1] > v.start) {
                global.CACHE.gameserver.opentime[1] = v.start;
            }
        }
        else {
            global.CACHE.gameserver.normal[v.servid] = v;
            if (global.CACHE.gameserver.opentime[0] == 0 || global.CACHE.gameserver.opentime[0] > v.start) {
                global.CACHE.gameserver.opentime[0] = v.start;
            }
        }
        global.CACHE.gameserver.list[v.servid] = v;
    }
}

module.exports = exports = async function (type) {
    if (type == "version") {
        await version();
    }
    else if (type == "hotupd") {
        await hotupd();
    } else if (type == "qzupd") {
        await qzupd()
    }
    else if (type == "channel") {
        await channel();
    }
    else if (type == "notice") {
        await notice();
    }
    else if (type == "maintain") {
        await maintain();
    }
    else if (type == "whitelist") {
        await whitelist();
    }
    else if (type == "ban") {
        await ban();
    }
    else if (type == "gameserver") {
        await gameserver();
    }
    else {
        await version();
        await hotupd();
        await qzupd()
        await channel();
        await notice();
        await maintain();
        await whitelist();
        await ban();
        await gameserver();
    }
    // console.log(global.CACHE)
}