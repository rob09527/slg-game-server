'use strict'


module.exports = exports = async function (ctx, next) {
    const ip = ctx.ip.split(':').pop();
    ctx.body = {};
    global.CLIENT_UDP = global.CLIENT_UDP || { refresh: 0 };
    let { gameid, platform, appVersion } = ctx.request.body;
    //global.CACHE.hotupd
    //面向玩家的版本号
    let userappVersion = { version: -1 }
    let sysappVersion = { version: -1 }
    for (let v of global.CACHE.qzupd.list) {
        if (v.version >= userappVersion.version && v.status == 2 && gameid == v.gameid) {
            userappVersion = v;
        }
        if (v.version >= sysappVersion.version && v.status == 1 && gameid == v.gameid) {
            sysappVersion = v
        }
    }
    const whiteObj = global.CACHE.qzupd.white;
    let qzceshi = false
    console.log(whiteObj.whitelist[ip], ip)
    if (whiteObj && whiteObj.whitelist[ip]) {
        qzceshi = true
    }
    if (userappVersion.version > Number(appVersion)) {
        console.log("user 强更")
        ctx.body.fouceURL = userappVersion.url
        return
    }
    if (sysappVersion.version > Number(appVersion) && qzceshi) {
        console.log("测试 强更")
        ctx.body.fouceURL = sysappVersion.url
        return;
    }

    // ios提审校验
    // let d = await ctx.dao.iosversion.find({status: 1, version: appVersion, gameid: gameid}).sort({_id: -1}).limit(1);
    let verify = false;
    for (let v of global.CACHE.version) {
        if (v.version == appVersion && v.gameid == gameid) {
            verify = true;
            break;
        }
    }
    const type_url = global.setting.type_url || 1;          // 不跳转
    if (verify) {
        ctx.body.isAppVerify = 1;
        if (type_url == 2) {
            ctx.body.newURL = global.setting.new_url;   // 审核服跳转模式
        }
    }
    else {
        if (type_url == 3) {
            ctx.body.newURL = global.setting.new_url;   // 正式服跳转模式
        }
    }
    if (verify || ctx.body.newURL) { // 审核状态或有跳转
        return ctx.body
    }
    appVersion = parseInt(appVersion);
    //测试包

    // let o = await ctx.dao.hotupd.find({status: 1, platform}).sort({_id: -1}).limit(1);
    // let updateInfo = o[0];
    let updateInfo = undefined;
    for (let v of global.CACHE.hotupd.list) {
        if (v.status == 1 && v.platform == platform) {
            updateInfo = v;
            break;
        }
    }
    if (updateInfo) {
        const curVersion = parseInt(updateInfo.version);
        if (updateInfo.force_cb) {
            // 强制回退
            ctx.assert(curVersion != appVersion, 'no need up');
        } else {
            ctx.assert(curVersion > appVersion, 'no need up');
        }
        // const whiteObj = await ctx.dao.hotupd.findOne({status: -1})
        const whiteObj = global.CACHE.hotupd.white;
        if (whiteObj && whiteObj.whitelist[ip]) {
            ctx.body.hotURL = updateInfo.url;
            return ctx.body;
        }
    }
    //正式包
    // o = await ctx.dao.hotupd.find({platform, status: 2}).sort({_id: -1}).limit(1);
    // updateInfo = o[0];
    updateInfo = undefined;
    for (let v of global.CACHE.hotupd.list) {
        if (v.status == 2 && v.platform == platform) {
            updateInfo = v;
            break;
        }
    }

    ctx.assert(updateInfo, 'no need up');
    const curVersion = parseInt(updateInfo.version);
    if (updateInfo.force_cb) {
        // 强制回退
        ctx.assert(curVersion != appVersion, 'no need up');
    } else {
        ctx.assert(curVersion > appVersion, 'no need up');
    }
    ctx.body.hotURL = updateInfo.url;
    return ctx.body;
}
