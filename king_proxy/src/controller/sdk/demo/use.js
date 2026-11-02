'use strict'

const crypto = require('crypto');

/**
 * 签名验证逻辑
 * @param appsecret
 * @param params
 * @return {string}
 */
const sign_fn = function (appsecret = '', params = {}) {
    let str = [];
    for (let [key, val] of Object.entries(params)) {
        if (key === 'sign') continue;
        if (!val || val.length < 1) continue;
        str.push(key + '=' + val);
    }
    str.sort();
    str = str.join('&') + appsecret;
    return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}

const config_params = {
    '<gameid>': {
        gameid: '1231',
        appkey: 'demokey',
        appsecret: 'appsecret',
    }
}

module.exports = async (ctx, next) => {
    let gameid = ctx.request.body.gameid || ctx.request.query.game_id;
    ctx.params = config_params[gameid];
    ctx.assert(ctx.params, 'invalid bundle');

    ctx.signfn = sign_fn.bind(null, ctx.params.appsecret);
    await next();
}
