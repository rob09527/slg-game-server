'use strict'
const moment = require("moment");

/**
 * 开发模式的登陆
 * @type {(function(*, *): Promise<void>)|*}
 */
module.exports = exports = async function (ctx, next) {
    let {
        uid,
        servid,
    } = ctx.request.body;
    console.log('dev login', ctx.ip, uid, servid, moment().format('YYYY-MM-DD HH:mm:ss'))
    ctx.assert(uid, 'miss uid');
    ctx.assert(!isNaN(servid), 'error servid');
    // const servObj = await global.dao.gameserver.findOne({servid: +servid});
    const servObj = global.CACHE.gameserver.list[+servid];
    ctx.assert(servObj, 'invalid servid');

    if (!servObj.status) {
        const ip = ctx.ip.split(':').pop();
        // const is_wl = await ctx.dao.whitelist.iswl(uid, ip);
        const is_wl = global.CACHE.whitelist[uid] || global.CACHE.whitelist[ip]
        ctx.assert(is_wl, 'serv maintain'); // 服务器维护
    }


    if (!global.config.DEV_LOGIN_REGISTER) { // 开发登录锁定注册逻辑,避免开发调试正式服时，输入错uid导致创建脏用户
        // 正式环境内部开发人员可以直接掉API 直接使用 uid 登陆， 只能登陆已有的角色
        const role = await global.remote.agent_findrole({ uid, servid: +servid });
        ctx.assert(role, 'role err'); //
    }
    // 非正式环境，可以随意使用任意的 uid 登陆
    let sdkInfo = {
        openid: "",
        channel: 0,
        wordcheck: 0,
    }

    const token = await global.dao.token.login(uid, servid, {
        bundle: 'default',
        gameid: 0,
        platform: ctx.request.header['platform'],
        sdkInfo
    });
    console.log("消息来到", token)
    ctx.body = token;

}
