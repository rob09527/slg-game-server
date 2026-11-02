const moment = require('moment');
const crypto = require("crypto");
const path = require("path");
const fs = require('fs');
/**
 *
 * @param app {App}
 * @return {AppConfig}
 */
module.exports = app => {

    /**
     *
     * @type {AppConfig}
     */
    const config = {};
    config.PROTOCOL = 'http'; // 强制使用http 协议, 默认 https协议
    // config.SSL_PATH = {  // 如果是 https配置需要配置 证书地址
    //     KEY: '/yours-path/www.xxx.com.key',
    //     CRT: '/yours-path/www.xxx.com.pem'
    // };
    config.port = 8443;
    config.proxy = 'http://127.0.0.1:8001';

    // body 解析配置
    // config.bodyParse = {};
    // koa-router 配置选项
    // config.routerOpt = {}


    // 自定义密码加密规则
    // config.encryptPassword = (password) => {
    //     return util.md5(password);
    // };
    // 自定义密码校验
    // config.verifyPassword = (reqPassword, verPassword) => {
    //     return app.config.encryptPassword(reqPassword) === verPassword;
    // }
    const TOKEN_SALT = process.env.TOKEN_SALT || "YOUR_TOKEN_SALT";
    const TOKEN_IV = Buffer.alloc(16, 0); // 初始化向量。
    const TOKEN_ALGORITHM = 'aes-192-cbc';
    const getIp = (ctx) => {
        // TODO 根据自己 nginx的转发情况配置 IP，很关键，不然会登陆不上
        const ip = ctx.headers['x-real-ip'] || ctx.request.ip;
        return ip;
    }
    config.createToken = (adminId, ctx) => {
        const ip = getIp(ctx);
        const key = crypto.scryptSync(ip, TOKEN_SALT, 24);
        const cipher = crypto.createCipheriv(TOKEN_ALGORITHM, key, TOKEN_IV);
        const data = adminId + "||" + Date.now();
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    // 通过 ip 来再次验证 token, 避免token 被盗用
    config.verifyToken = (token, adminId, ctx) => {
        try {
            const ip = getIp(ctx);
            const key = crypto.scryptSync(ip, TOKEN_SALT, 24);
            const decipher = crypto.createDecipheriv(TOKEN_ALGORITHM, key, TOKEN_IV);
            let decoded = decipher.update(token, 'hex', 'utf8');
            decoded += decipher.final('utf8');
            const [aid] = decoded.split("||");
            return aid == adminId;
        } catch (e) {
            return false;
        }
    }

    // 错误监听
    // config.onerror = {
    //     html(err, ctx) {
    //         ctx.body = `<h3>${err}</h3><p>${err.stack}</p>`;
    //         ctx.status = 500;
    //     },
    //     json(err, ctx) {
    //         ctx.body = {code: 500, message: err.message || err, stack: err.stack};
    //     }
    // }
    config.log = {
        path: null,
        write: (adminId, adminName, action, body, query, result, ctx) => {
            const ip = getIp(ctx);
            console.log('DO ACTION', adminName, action, ip, new Date().format())
            if (result && Array.isArray(result.items) && !isNaN(result.total)) { // 查询日志不记录
                return;
            } else if (action.indexOf('-role-analyze-board-data') > 0) {
                // 看板数据日志不写入
                return;
            }

            app.db.mongo.log.create({
                adminId,
                adminName,
                action,
                body,
                query,
                ip: ip
            })
        }
    };
    const [, , ...params] = process.argv;
    let configpath = params[params.length - 1];

    Object.assign(config, require('../config.default'));
    configpath = configpath ? path.resolve(configpath) : path.join(__dirname, '../config.local.js');
    if (fs.existsSync(configpath)) {
        Object.assign(config, require(configpath));
    }

    return config;
}
