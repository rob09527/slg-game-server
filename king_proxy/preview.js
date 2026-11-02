'use strict'
const {
    curl,
} = require('urllib');

const raw = require('raw-body');
const inflate = require('inflation');

const check = (appversion, platform, bundle, query) => {


    if (!global.config.PREVIEW_URL) return false;

    // 支付类通知接口， 订单id前缀不对，需要转走
    if (query.game_trade_no) {
        const ORDER_PREFIX = (global.config.ORDER_PREFIX || 'KH');
        if (query.game_trade_no.startsWith('HIDE')) { // 隐藏服订单
            return 'HIDE';
        }
        return !query.game_trade_no.startsWith(ORDER_PREFIX);
    }

    if (!global.PREVIEW) return false;

    const checkappversion = global.PREVIEW.appversion || [];

    if (!checkappversion.includes(appversion)) {
        return false;
    }
    if (Array.isArray(global.PREVIEW.platform) && !global.PREVIEW.platform.includes(platform)) {
        return false;
    }

    if (Array.isArray(global.PREVIEW.bundle) && !global.PREVIEW.bundle.includes(bundle)) {
        return false;
    }
    return true;
}

const proxy = function (path, method, ip, body, header = {}, bl) {
    let opt = {
        method: method,
        dataType: 'text',
        contentType: 'text',
        data: method === 'GET' ? undefined : (body || "p5Mhrloba7JO9V5hhXGK1w=="),
        headers: {
            'x-real-ip': ip,
            ...header
        }
    }
    let url = global.config.PREVIEW_URL + path;
    if (bl === 'HIDE') {
        url = global.config.HIDE_URL + path;
    }

    return curl(url, opt);
}
/**
 * 转发至审核服的登录服逻辑
 * @param ctx
 * @param next
 */
module.exports = async function (ctx, next) {
    console.log('---->', ctx.path, ctx.ip, new Date().format(), ctx.ip, "=====", ctx.headers);
    const n = Date.now();

    const appversion = ctx.headers['appversion'];
    const platform = ctx.headers['platform'];
    const bundle = ctx.headers['bundle'];
    const robtest = ctx.headers['robtest'];
    const bl = check(appversion, platform, bundle, ctx.request.query);
    // || robtest
    if (bl || robtest) {
        const data = await raw(inflate(ctx.req || ctx), { encoding: 'utf8' });
        const res = await proxy(ctx.request.originalUrl, ctx.method, ctx.ip, data, { 'x-kaihei': ctx.headers['x-kaihei'] }, bl).catch(e => e);
        ctx.body = res && res.res ? res.res.data : { error: res || res.message };
        console.log()
        console.log('<---- by review', ctx.path, ctx.ip, Date.now() - n + 'ms');
        return;
    }
    await next();
    console.log('<----', ctx.path, ctx.ip, Date.now() - n + 'ms');
}

module.exports.proxy = proxy;
