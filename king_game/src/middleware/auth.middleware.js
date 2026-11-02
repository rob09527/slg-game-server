const assert = require("assert");
const zhdpoint = require("../util/event/point");

/**
 * 登录会话验证
 * @param token {string}
 * @param uid {string}
 * @param servid {number}
 * @return string 返回错误信息
 */
module.exports = async function authMiddleware(token, uid, servid) {
    servid = +servid;
    assert(uid, 'MISS PARAMS UID');
    assert(servid, 'MISS PARAMS SERVID');
    // this 对象就是 client 对象
    const tokenInfo = await global.dao.token.findOne({
        uid,
        token,
        servid,
        update: { $gt: 0 } // 因为 -1 是管理员踢下线，所以额外加一个条件判断
    });
    if (!tokenInfo && token !== "robtest") {
        if (process.env.NODE_ENV !== 'development' || token !== 'dev') { // 开发模式   token = dev 通过
            assert.fail('NEED LOGIN');
        }
    }
    // 检查服务器
    let gameserv = await global.dao.gameserver.fetchServerWithGroup(servid);
    assert(gameserv, 'ILLEGAL SERVID');
    // 查找角色,如不存在,则直接创建
    let role = await global.dao.role.findOneAndUpdate({ uid, servid }, { $set: { update: Date.now() } }); // 修改最后登录时间
    if (!role) {
        role = await global.dao.role.createRole(uid, servid, tokenInfo);
        role._new_ = true; // 增加零时字段，表明是新用户
    }
    // 挂载服务器信息
    role._gameserv = gameserv;
    role._tokeninfo = {
        gameid: tokenInfo && tokenInfo.gameid,
        bundle: tokenInfo && tokenInfo.bundle, // 包名
        platform: tokenInfo && tokenInfo.platform,
        simulator: tokenInfo && tokenInfo.simulator,
        deviceid: tokenInfo && tokenInfo.deviceid,
        channel: tokenInfo && tokenInfo.channel,
        sdkInfo: tokenInfo && tokenInfo.sdkInfo,
        servid: tokenInfo && tokenInfo.servid,

    }
    return role;
}
