'use strict'
const moment = require("moment");

module.exports = exports = async function (ctx, next) {
    const {
        platform = '',
        simulator = '',
        deviceid = '',
        channel = '',
        phonetype = '',
        bundle = '',
        servid,
        gameid = 0,
        shareid = 0,
        deviceInfo = {}

    } = ctx.request.body;
    let uid = ctx.request.body.uid;
    ctx.assert(uid, 'miss uid');

    uid = channel + uid; // 拼接uid
    // const isban = await ctx.dao.ban.is(uid); // 封号检查
    const expired = global.CACHE.ban[uid] || 0;
    const isban = expired > 0 && expired > Date.now();
    ctx.assert(!isban, 'user blocked1' );

    ctx.assert(!isNaN(servid), 'error servid');
    // const servObj = await global.dao.gameserver.findOne({servid: +servid});
    const servObj = global.CACHE.gameserver.list[+servid];
    ctx.assert(servObj, 'invalid servid');

    if(!servObj.status) {
        const ip = ctx.ip.split(':').pop();
        // const is_wl = await ctx.dao.whitelist.iswl(uid, ip);
        const is_wl = global.CACHE.whitelist[uid] || global.CACHE.whitelist[ip];
        ctx.assert(is_wl, 'serv maintain'); // 服务器维护
    }

    if (Date.now() < servObj.start){
        const ip = ctx.ip.split(':').pop();
        // const is_wl = await ctx.dao.whitelist.iswl(uid, ip);
        const is_wl = global.CACHE.whitelist[uid] || global.CACHE.whitelist[ip];
        ctx.assert(is_wl, 'serv maintain!'); // 服务器维护
    }

    let sdkInfo = {
        openid: "",
        channel: 0,
        wordcheck: 0,
        shareid,
    }
    let sdkdata = ctx.request.body.sdkdata;
    if(sdkdata ){
        sdkInfo.channel = sdkdata.channel || 0;
        sdkInfo.wordcheck = sdkdata.check_word || 0;
        if(platform == "wechatgame") {
            sdkInfo.openid = sdkdata.channel_openid;
        }
    }

    const tokenRes = await ctx.dao.token.login(uid, servid, {
        gameid,
        platform,
        simulator,
        deviceid: deviceid || deviceInfo.deviceId,
        channel,
        bundle,
        phonetype,
        deviceInfo,
        sdkInfo
    });
    tokenRes.uid = uid;
    ctx.body = tokenRes;
}
