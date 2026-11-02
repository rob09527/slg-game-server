const SocketAction = require("../socket/socket.action");
const controllerDispatch = require('../controller/init')();
const errorMiddleware = require("../middleware/error.middleware");
const assert = require("assert");
const { forEach } = require("lodash");

/**
 * 构造 类似 koa 的 context , 目的 为了兼容 之前的 后端逻辑
 * @param client
 * @param info
 * @return {{path, request: {query: {}, body}, role: (*|Object|RTCDtlsRole|RTCIceRole), data, IP: string, params: {}}}
 */
const makeCtx = (client, info) => {
    // .. 获取后续结构会有变化
    let ctx = {
        _controllerDispatch: controllerDispatch,
        path: info.path,
        data: info.data,
        IP: client.address,
        ip: client.address,
        role: client.role,
        check: client.check,
        gameCache: client.gameCache ? client.gameCache : {},
        client,
        dao: global.dao,
        assert,
        params: {},
        request: { // 兼容 koa
            body: Object.assign(info.data || {}, client.role._tokeninfo), // 把本次登录时的 设备信息渠道信息传递给 body,方便旧下单逻辑通用
            query: {},
        },
        body: ''
    }
    return ctx;

}

async function gameCache(ctx) {
    let gameCache = {}
    gameCache.mjxxl = await ctx.role.getDailyInfo(ctx)
    return gameCache
}

/**
 * 封装 旧逻辑的 koa 功能
 * @param client {SocketClient}
 * @param data {any}
 * @return {Promise<void>}
 */
exports.main = async function (client, data) {
    const ctx = makeCtx(client, data);
    ctx.gameCache = await gameCache(ctx)
    console.log('--->', ctx.role && ctx.role.uid, ctx.role && ctx.role.servid, ctx.IP, ctx.path, new Date().format())
    let t = Date.now();
    // 客户端相同协议连续发送
    let flag = 0;
    const now_sec = Math.floor(t / 1000);
    if (ctx.check.path_last == ctx.path && ctx.check.path_time == now_sec) {
        ctx.check.path_count++;
        if (ctx.check.path_count > 7) {
            console.log('<---', ctx.role && ctx.role.uid, ctx.role && ctx.role.servid, ctx.IP, ctx.path, 'err:' + ctx.check.path_count, new Date().format());
            if (ctx.check.path_count == 8) {
                const rid = ctx.role._id;
                CLIENT_POOL[rid] && CLIENT_POOL[rid].disconnect(4106, 'api lock');
            }
            return;
        }
        if (ctx.check.path_count < 5) {   // 允许连发5次
            flag = 2;
        }
        else {
            ctx.body = { error: 'api lock' };
        }
    }
    else {
        flag = 1;
    }
    if (flag) {
        if (flag == 1) {
            ctx.check.path_last = ctx.path;
            ctx.check.path_time = now_sec;
            ctx.check.path_count = 0;
        }
        await controllerDispatch(ctx).catch(errorMiddleware.bind(ctx));

    }

    client.gameCache = await gameCache(ctx)

    client.emit(SocketAction.API, {
        path: ctx.path,
        error: ctx.body.error,
        data: ctx.body.error ? undefined : ctx.body // 有 error 时，不返回data
    }, data.msgid);
    console.log('<---', ctx.role && ctx.role.uid, ctx.role && ctx.role.servid, ctx.IP, ctx.path, (Date.now() - t) + 'ms', new Date().format());
}
