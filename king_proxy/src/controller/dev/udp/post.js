'use strict'
const moment = require("moment");

/**
 * 开发热更新
 * @type {(function(*, *): Promise<void>)|*}
 */
module.exports = exports = async function (ctx, next) {
    ctx.body = {};
    let {appVersion, gameid} = ctx.request.body;
    let verify = false;
    for (let v of global.CACHE.version){
        if(v.version == appVersion && v.gameid == gameid){
            verify = true;
            break;
        }
    }
    const type_url = global.setting.type_url || 1;          // 不跳转
    if (verify){
        ctx.body.isAppVerify = 1;
        if(type_url == 2) { 
            ctx.body.newURL = global.setting.new_url;   // 审核服跳转模式
        }
    } 
    else {
        if(type_url == 3){
            ctx.body.newURL = global.setting.new_url;   // 正式服跳转模式
        }
    }
    // if(verify || ctx.body.newURL){ // 审核状态或有跳转
    //     return ctx.body
    // }
    // ctx.assert(false, 'no need up');
}
