'use strict'
const assert = require('assert');
const exec = {
    confirm: require('./confirm'),
    verify: require('./verify')
}
/**
 * cdkey 使用确认
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_cdkey();
 *
 * @param fn {'confirm'|'verify'}
 * @param key {string}
 * @param uid {string}
 * @param servid {number}
 * @param rid {string}
 * @param option {{bundle: string, channel: string, level:number}}
 * @return {Promise<any>}
 */
module.exports = async function (fn, key, uid, servid, rid, option) {
    const ctx = {
        assert,
        dao: global.dao,
    };
    let {
        bundle = "",
        channel = '',
        level = '-1'
    } = option || {};

    ctx.one = await ctx.dao.cdkey.findOne({key});
    ctx.assert(ctx.one, 'cdkey nexist');	// 不存在
    ctx.assert(!ctx.one.pause, 'cdkey pause');	// 暂停使用
    ctx.assert(ctx.one.start < Date.now(), 'before start');	// 尚未开始
    ctx.assert(ctx.one.end > Date.now(), 'after expire');	// 已过期
    if (ctx.one.remain > -1) ctx.assert(ctx.one.remain > 0, 'cdkey runout');	// 次数用尽
    ctx.assert(!ctx.one.bundles || ctx.one.bundles.includes(bundle), "bundle forbit") // 包名限制
    if (ctx.one.channel || ctx.one.channels) {
        let keyChannels = ctx.one.channels || [ctx.one.channel];
        channel = channel.split(',');
        ctx.assert(keyChannels.some(ch => channel.includes(ch)), 'channel forbit');	// 渠道不可用
    }
    servid = Number(servid);
    if (ctx.one.servid || ctx.one.servids) {
        let keyServids = ctx.one.servids || [ctx.one.servid];
        ctx.assert(keyServids.includes(servid), "server forbit"); // 服务器不可用
    }
    if (ctx.one.level) ctx.assert(Number(level) >= ctx.one.level, 'level forbit');	// 等级不足

    return exec[fn](ctx.one, uid, servid, rid);
}
