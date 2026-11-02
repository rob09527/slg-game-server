'use strict'

/**
 * 登陆成功后返回 服务列表
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */

module.exports = async (ctx, next) => {
    let {
        gameid,
        channel,
        appVersion,
        sdkdata,
    } = ctx.request.body;
    // let {
    //     // sign,
    //     // user_id,
    //     // is_new
    // } = sdkdata;
    let {
        uid,
        accesstoken
    } = sdkdata
    console.log("用户信息", sdkdata)
    let jwt = await sign_login_fid(accesstoken)
    //这是越南方的fid
    ctx.assert(jwt, 'verify fail'); // 登陆验证
    console.log("用户信息", uid, "通过")
    // ctx.assert(ctx.loginfn(sdkdata) === sign, 'verify fail'); // 登陆验证
    const ip = ctx.ip.split(':').pop();
    // ios提审校验
    // let d = await ctx.dao.iosversion.find({status: 1, version: appVersion, gameid: gameid}).sort({_id: -1}).limit(1);
    // let verify = d[0] ? 1 : 0;
    let verify = 0;
    for (let v of global.CACHE.version) {
        if (v.version == appVersion && v.gameid == gameid) {
            verify = 1;
            break;
        }
    }
    // 通过返回服务列表
    // let uid = user_id;
    let opts = {
        uid: uid,
        gameid: gameid,
        channel: channel,
        verify: verify,
        ip: ip,
        // isnew: is_new
    }

    let { serverlist, opentime, notice } = await ctx.dao.gameserver.fetchPlayerServList(opts);

    let servertime = Date.now();
    ctx.body = {
        uid,
        serverlist,
        opentime,
        servertime
    }
    if (notice) {
        let type = servertime >= opentime ? 0 : 1;
        // let d = await ctx.dao.maintain.findOne({type});
        let d = global.CACHE.maintain[type];
        if (d) ctx.body.noticestr = d.content;
    }
}


const sign_login_fid = async function (jwtToken) {
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    const JwksClient = (...args) => import('jwks-client').then(({ default: JwksClient }) => JwksClient(...args));
    const fidData = jwt.decode(jwtToken, { complete: true, json: true })
    const header = Buffer.from(JSON.stringify(fidData.header)).toString('base64url')
    const payload = Buffer.from(JSON.stringify(fidData.payload)).toString('base64url')

    var currentTime = Number(Date.parse(new Date()).toString().substr(0, 10));
    if (currentTime > fidData.payload.exp) {
        console.warn('expired token')
        console.log('expired token')
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
    console.log("用户kid", fidData.header.kid)
    let publicKey = await getjwks(fidData.header.kid)
    const buffer = Buffer.from(fidData.signature, 'base64');
    console.log("用户publicKey", publicKey)
    const isVerified = crypto.verify(
        "sha256",
        Buffer.from(code),
        {
            key: publicKey,
        },
        buffer
    )
    console.log("用户检查结果", publicKey)
    if (isVerified) {
        return fidData
    } else {
        return isVerified
    }
}
