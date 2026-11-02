'use strict'

const _ = require('lodash');
const businessCode = require("../../../util/businessCode");
module.exports = async (ctx, next) => {
    let {
        fid,   //角色ida
        serverid,  //服务器id
    } = ctx.request.body;

    let gameservs = Object.values(global.gameservs)
    const game = gameservs[_.random(0, gameservs.length - 1)];
    let uid = 'sdk_hunfu' + fid
    const roles = await game.remote.findRolesByUid(uid);
    const roleMap = {};
    roles.forEach(role => {
        roleMap[role.servid] = role;
    });
    const role = roleMap[serverid]
    if (!role) {
        ctx.body = businessCode.user_does_not_exist;
        return
    }
    let data = {
        name: role.name,
        level: role.level,
        vip: role.vip,
        uid: uid,
        rno: role.rno,
        rid: role.rid,
        update: role.update,
    }
    ctx.body = data


}





