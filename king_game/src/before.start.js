'use strict'

const modelInit = require("./model/init");
const elasticInit = require("./elastic.init");
const redisInit = require("./redis.init");
const remoteInit = require('./remote.init');
const moment = require("moment");
const assert = require("assert");
const SocketAction = require('./socket/socket.action');
const SocketRedis = require('./socket/socket.redis');

const CLIENT_POOL = {};
global.CLIENT_POOL = CLIENT_POOL; // 全局客户端链接池
Object.defineProperty(global, "CLIENT_POOL", {writable: false});
// 转化服务器时区格式
const timeoffset = Math.floor(new Date().getTimezoneOffset()/60);
global.TIMEZONE = timeoffset > 0 ? `-${("0"+timeoffset).substr(-2)}:00` : `+${("0"+Math.abs(timeoffset)).substr(-2)}:00`;
Object.defineProperty(global, 'TIMEZONE', {writable: false});
require('rx-apiwheel');
// 处理一些原生对象封装
Date.prototype.format = function (formatStr = 'YYYY-MM-DD HH:mm:ss') {
    return moment(this).format(formatStr);
};

/**
 * 兼容旧版本的推送
 * @param role {string|{_id: string}} rid 或者 角色对象
 * @param data {any}
 * @param action {string}
 */
global.pushClient = (role, data, action = SocketAction.O_PUSH) => {
    const rid = role._id || role;

    if (CLIENT_POOL[rid]) {
        CLIENT_POOL[rid].emit(action, data);
    } else {
        global.remote.pushClient(rid, data, action); // 如果不在本实例，则调用远程函数，让对应实例去执行该推送函数
    }
}

module.exports = async function () {
    global.assert = assert;
    Object.defineProperty(global, 'assert', {writable: false});
    await require('./config.init')();
    global.ACTIONS = await require('./action/init')(); // 习惯全局常量都大写
    Object.defineProperty(global, 'ACTIONS', {writable: false});

    global.dao = await modelInit(global.config.DB);
    Object.defineProperty(global, 'dao', {writable: false});

    global.elastic = await elasticInit(global.config.ES);
    Object.defineProperty(global, 'elastic', {writable: false});

    global.redis = await redisInit(global.config.REDIS);//排行榜
    Object.defineProperty(global, 'redis', {writable: false});


    global.cacheRedis = global.config.CACHEREDIS ? await redisInit(global.config.CACHEREDIS ) : global.redis ;//正常数据
    Object.defineProperty(global, 'cacheRedis', {writable: false});

    global.socketRedis = await SocketRedis.getInstance(global.config.REDIS);
    Object.defineProperty(global, 'socketRedis', {writable: false});

    global.remote = remoteInit();
    Object.defineProperty(global, 'remote', {writable: false});

    global.services = require('./services');
    Object.defineProperty(global, 'services', {writable: false});
    global.CACHE = {}; // 全局缓存空间
    global.ACTIVITY = await global.dao.activity.init(); // 初始化活动配置
    await global.dao.gameconfig.init(); // 重载数据库动态游戏配置
    global.config.ZHD = new Proxy({}, {
        get(target, type, receiver) {
            const a = global.ACTIVITY[type.toLowerCase()];
            if (a) {
                return [a.start, a.etime]
            }
            console.log('MISS ACTIVITY DATE CONFIG', type);
            return [0, 0];
        }
    });

    // 上报日志
    global.sendlog = (data) => {
        global.elastic.insertOne('_doc', data, 'addcst-' + moment().format("YYYY-MM-DD")).catch(console.error);
    }
}
