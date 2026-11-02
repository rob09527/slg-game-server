
'use strict'

const https = require('https');
const querystring = require('querystring');
exports.name = "通知越南方数据更新";
// 定时器语句
exports.cron = "0/30 * * * * ?";

exports.main = async function () {
    let configInfo = await global.dao.websaleconfig.find({ 'notify.state': 1 }).limit(10)
    if (!configInfo || configInfo.length == 0) {
        return;
    }
    const proxyconfig = await global.remote.proxy_getproxyconfig()
    if (!proxyconfig.VIETNAM) {
        console.log("没有配置越南方域名数据")
        return;
    }
    if (!global.vietnamcache || (global.vietnamcache.updatetime && global.vietnamcache.updatetime + 1000 * 60 * 30 < Date.now())) {
        var results = await fetchToken(proxyconfig.VIETNAM)
        global.vietnamcache = {}
        global.vietnamcache.access_token = results.access_token
        global.vietnamcache.updatetime = Date.now()
    }
    console.log(global.vietnamcache)
    await Promise.all(configInfo.map(async e => {
        let result = await noticeState(proxyconfig.VIETNAM, Number(e.packageid), e.state, global.vietnamcache.access_token)
        if (result && result.code) {
            await global.dao.websaleconfig.updateOne({
                packageid: e.packageid
            }, {
                $set: {
                    notify: {
                        state: 2,
                        message: JSON.stringify(result),
                        update: Date.now()
                    }
                }
            });
        }


    }))
}



async function fetchToken(vietnam) {
    return new Promise((resolve, reject) => {
        const { clientId, client_secret, grant_type, callback, tokenhost, updatestatushost } = vietnam
        // 定义你的请求参数
        const postData = {
            'client_id': clientId,
            'client_secret': client_secret,
            'grant_type': grant_type
        };
        // 使用 querystring.stringify 对数据进行 URL 编码
        const postDataStr = querystring.stringify(postData);
        // 定义你的请求选项
        const options = {
            hostname: tokenhost,
            rejectUnauthorized: false, // 忽略证书验证
            port: 443, // 默认为 443
            path: '/connect/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };
        // 创建一个请求
        const req = https.request(options, (res) => {
            let data = '';

            // 监听 'data' 事件
            res.on('data', (chunk) => {
                data += chunk;
            });

            // 监听 'end' 事件
            res.on('end', () => {
                try {
                    // 假设响应是 JSON 格式的
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });

        // 发送请求数据
        req.write(postDataStr);
        req.end();
    });
}

async function noticeState(vietnam, packageID, status_Partner, accesstoken) {
    return new Promise((resolve, reject) => {
        const { updatestatushost } = vietnam
        // 定义你的请求参数
        const postData = {
            'packageID': packageID,
            'status_Partner': status_Partner,
        };
        // 使用 querystring.stringify 对数据进行 URL 编码
        const postDataStr = JSON.stringify(postData);
        // 定义你的请求选项
        const options = {
            hostname: updatestatushost,
            rejectUnauthorized: false, // 忽略证书验证
            port: 443, // 默认为 443
            path: '/api/Meow/PackageUpdateStatus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accesstoken}`,
            }
        };
        // 创建一个请求
        const req = https.request(options, (res) => {
            let data = '';

            // 监听 'data' 事件
            res.on('data', (chunk) => {
                data += chunk;
            });

            // 监听 'end' 事件
            res.on('end', () => {
                try {
                    // 假设响应是 JSON 格式的
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });

        // 发送请求数据
        req.write(postDataStr);
        req.end();
    });
}



