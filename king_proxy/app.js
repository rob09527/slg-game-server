'use strict'

/*
    加载全局方法
    加载服务器配置
    加载后端游戏配置&重载配置
    启动数据库
    特定数据加载
    加载控制器
    开始监听test
*/
require('rx-apiwheel')
const debug = require('debug')('kaihei:launcher');
const path = require('path');
const moment = require('moment');
// 处理一些原生对象封装
Date.prototype.format = function (formatStr = 'YYYY-MM-DD HH:mm:ss') {
    return moment(this).format(formatStr);
};

if (process.env.DEBUG) {
    global.FAIL = console.error.bind(null, 'FAIL:');
} else {
    global.FAIL = function () {
    };
}

try {
    global.config = require('./loadservconfig')(process.argv[2]);
} catch (e) {
    console.error(e);
    global.FAIL('cant load serv config', '-', process.argv[2]);
    process.exit(1);
}

global.gameservs = {};
global.fightservs = {};
global.jwts = {};

debug(global.config);
// 启动数据库
require('./startdb')(global.config.DB)
    .then(_ => {
        return require('./loaddao')(path.resolve(__dirname, './src/model'));
    }).then(dao => {
        global.dao = dao;
        dao = global.dao;
        const Koa = require('koa');
        const app = new Koa();
        global.remote = require('./src/remote.init')();
        Object.defineProperty(global, 'remote', { writable: false });
        // err handler
        app.context.onerror = require('./util/err_handler');

        // cors
        app.use(require('@koa/cors')());

        // 加载定向审核服的配置
        dao.previewcfg.getConfig().then(preview => {
            global.PREVIEW = preview;
        })
        //
        app.use(require('./preview'));

        // encryptdecrypt
        if (global.config.CIPHER) {
            const { ALGORITHM, KEY, IV } = global.config.CIPHER;
            const { NO_ENCRYPT_URLs } = global.config;
            app.use(require('./whisper')(ALGORITHM, KEY, IV, NO_ENCRYPT_URLs));
        } else {
            app.use(require('koa-body')({ multipart: true }));
        }

        // __verify
        app.use(async (ctx, next) => {
            await next();
            const { __verify } = ctx.request.body;
            if (ctx.body && __verify) ctx.body = { __verify: __verify, data: ctx.body };
        })

        // log
        if (process.env.DEBUG && process.env.DEBUG.indexOf('kaihei') != -1) {
            const logger = require('koa-logger');
            app.use(logger());
        }


        app.use(async (ctx, next) => { // 业务中间键
            ctx.dao = dao;
            await next();
        })
        return require('./loadcontroller')(app, path.resolve(__dirname, './src/controller'));
    })
    .then(app => {
        let options = {
            port: global.config.SERVINFO.port
        }
        if (global.config.SSL) {
            options.ssl = {
                key: global.config.SSL.KEY,
                cert: global.config.SSL.CERT,
            }
        }
        return require('./createServers')(app, options);
    })
    .then(_ => {
        return require('./loadcron')(path.resolve(__dirname, './src/schedule'));
    })
    .then(_ => {
        return require('./loadover')();
    })
    .catch(err => {
        console.error(err);
    });
