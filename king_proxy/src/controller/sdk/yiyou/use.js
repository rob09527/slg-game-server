'use strict'

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwksClient = (...args) => import('jwks-client').then(({ default: JwksClient }) => JwksClient(...args));
/**
 * 签名验证逻辑
 * @param appsecret
 * @param params
 * @return {string}
 */
// const sign_login_other = function (appsecret = '', params = {}) {
//     let str = [];
//     for (let [key, val] of Object.entries(params)) {
//         if (key === 'token' ||
//             key === 'user_id' ||
//             key === 'time') {
//             str.push(key + '=' + val);
//         }
//     }
//     str.sort();
//     str = str.join('&') + appsecret;
//     return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
// }
//越南登录验证
const sign_login_fid = async function (jwtToken) {
    const fidData = jwt.decode(jwtToken, { complete: true, json: true })
    const header = Buffer.from(JSON.stringify(fidData.header)).toString('base64url')
    const payload = Buffer.from(JSON.stringify(fidData.payload)).toString('base64url')

    var currentTime = Number(Date.parse(new Date()).toString().substr(0, 10));
    if (currentTime > fidData.payload.exp) {
        console.warn('expired token')
        return false
    }
    const getjwks = async function (kid) {
        if (global.jwts[kid]?.exp > currentTime) {
            return global.jwts[kid].signingKey
        }

        const client = await JwksClient({
            strictSsl: true, // Default value
            jwksUri: global.config?.REMOTEURL?.FID ? global.config.REMOTEURL.FID : "YOUR_REMOTE_FID_URL"

        });
        let signingKey = await new Promise((resolve, reject) => {
            client.getSigningKey(kid, (err, key) => {
                if (err || !key) {
                    reject(undefined)
                    return
                }
                const signingKey = key.publicKey;
                resolve(signingKey)
            });
        })
        global.jwts[kid] = { signingKey, exp: currentTime }
        return signingKey
    }

    const code = header + "." + payload

    let publicKey = await getjwks(fidData.header.kid)

    const buffer = Buffer.from(fidData.signature, 'base64');

    const isVerified = crypto.verify(
        "sha256",
        Buffer.from(code),
        {
            key: publicKey,
        },
        buffer
    )

    if (isVerified) {
        return fidData
    } else {
        return isVerified
    }
}


// const sign_login = function (appsecret = '', params = {}) {
//     let str = [];
//     for (let [key, val] of Object.entries(params)) {
//         if (key === 'token' ||
//             key === 'user_id' ||
//             key === 'channel' ||
//             key === 'channel_flag' ||
//             key === 'channel_openid' ||
//             key === 'time') {
//             str.push(key + '=' + val);
//         }
//     }
//     str.sort();
//     str = str.join('&') + appsecret;
//     return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
// }

const sign_vietnam = function (appsecret = '', params = {}) {
    let signList = ["tranid", "fid", "serverid", "packageid", "coo_order_id", "price"];
    let str = []
    for (let [key, val] of Object.entries(params)) {
        if (!signList.includes(key)) continue;
        if (val === null || val === '' || val === 'null') continue;
        str.push(key + '=' + val);
    }
    str.sort();
    str = str.join('&') + appsecret;
    console.log(str)
    return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}


const sign_pay = function (appsecret = '', params = {}) {
    let str = [];
    for (let [key, val] of Object.entries(params)) {
        if (key === 'sign') continue;
        if (val === null || val === '' || val === 'null') continue;
        str.push(key + '=' + val);
    }
    str.sort();
    str = str.join('&') + appsecret;
    return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}

const config_params = {
    '1057': { // 全民动物城
        gameid: '1057',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '1061': { // 熊猫请出山
        gameid: '1061',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '1063': { // 硬核-全民动物城
        gameid: '1063',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '1065': { // 熊猫的江山
        gameid: '1065',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '1066': { // 熊猫三国
        gameid: '1066',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '1067': { // 三国志幻兽版
        gameid: '1067',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '2053': { // ios
        gameid: '2053',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '3013': { // 微信小游戏
        gameid: '3013',
        appkey: 'YOUR_YIYOU_APPKEY',
        appsecret: 'YOUR_YIYOU_APPSECRET',
    },
    '2000': { // 三国
        gameid: '2000',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    },
    '2001': { // 三国
        gameid: '2001',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    },
    '1057': { // 三国
        gameid: '1057',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    },
    '1059': { // 三国
        gameid: '1059',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    },
    '1500': { // 三国
        gameid: '1500',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    },
    '1501': { // 三国
        gameid: '1501',
        appkey: '',
        appsecret: global.config.VIETNAMKEY ? global.config.VIETNAMKEY : 'YOUR_VIETNAM_KEY',
    }
}

module.exports = async (ctx, next) => {

    let gameid = ctx.request.body.gameid || ctx.request.query.game_id;
    ctx.params = config_params[gameid];
    if (!ctx.params) {
        // let d = await ctx.dao.channel.findOne({gameid});
        let d = global.CACHE.channel[gameid];
        ctx.params = d || {};
    }
    ctx.assert(ctx.params, `invalid bundle ${gameid}`);

    // let sdkdata = ctx.request.body.sdkdata
    ctx.loginFid = sign_login_fid
    // ctx.loginfn = sdkdata && sdkdata.isign == 1 ? sign_login_other.bind(null, ctx.params.appkey) : sign_login.bind(null, ctx.params.appkey);
    ctx.payfn = sign_pay.bind(null, ctx.params.appsecret);
    ctx.h5postfn = sign_pay.bind(null, ctx.params.appsecret);
    ctx.payvietnam = sign_vietnam.bind(null, ctx.params.appsecret);
    ctx.channel = "dis" + gameid;

    await next();
}

