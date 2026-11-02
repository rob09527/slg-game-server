const path = require("path");
const assert = require('assert');
const [, , name] = process.argv;
let unit_config = require('./unit_config.json');
let unit_config_local = {};
try {
    unit_config_local = require('./unit_config_local.json');
} catch (e) {
    // console.error(e);
}
// 使用本地配置重载
unit_config = {...unit_config, ...unit_config_local};
const configpath = unit_config.config_path;

const config = require(path.join(__dirname, configpath));

const beforeStart = require("../src/before.start");
global.config = config;
Object.defineProperty(global, 'config', {writable: false});

let t = 0;
const timer_util = () => {
    const utime = Date.now() - t;
    t = Date.now();
    return utime;
}
beforeStart().then(_ => {
    global.pushClient = () => {
    }
    return global.dao.role.findOne(unit_config.role);
}).then(role => {
    return async function () {
        if (role) role._gameserv = await global.dao.gameserver.fetchServerWithGroup(role.servid);
        return role;
    }()
}).then(role => {
    const controllerDispatch = require('../src/controller/init')();

    // 封装controller的调用函数
    const exec = async (path, data = {}) => {
        const ctx = {
            path: path,
            data: data,
            IP: 'unit_test',
            ip: 'unit_test',
            role: role,
            dao: global.dao,
            assert,
            params: {},
            request: { // 兼容 koa
                body: data,
                query: {},
            },
            body: ''
        }
        await controllerDispatch(ctx);
        assert(!ctx.body.error, ctx.body.error);
        return ctx.body;
    }
    return require('./' + name + '.test.js')(exec, role, {
        timer: timer_util,
        assert: (ok, name, result, ms) => {
            console.log('【' + name + '】', '结果', ok ? '成功' : '异常', ok ? '' : (result.message || result), ms + 'ms');
        }
    });

}).then(r => {
    process.exit(1);
})
