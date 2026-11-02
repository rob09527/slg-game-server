'use strict'

module.exports = exports = async function (ctx, next) {
    let {
        sign,
        server_id,
        user_id
    } = ctx.request.query;
    ctx.assert(ctx.h5postfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

    const uid = ctx.channel + user_id;
    let srvers = null;
    if(server_id) {
        srvers = [];
        let str = server_id.split("|");
        for (const id of str) {
            srvers.push(Number(id));
        }
    }

    const game = Object.values(global.gameservs)[0]; // 取一个游戏实例
    const list = await game.remote.findRolesByUid(uid, true);
    let roles = [];
    for (const role of list) {
        if (srvers && srvers.indexOf(role.servid) < 0) {
            continue;
        }
        const servObj = await global.dao.gameserver.findOne({servid: role.servid});
        roles.push({
            server_id : role.servid, // 区服id
            server_name : servObj.name, // 区服名称
            role_id : role.rid, // 角色id
            role_no : role.rno, // 角色no
            role_name : role.name, // 角色名称
            role_level : role.level, // 角色当前等级
            power : role.power, //角色战力
            vip : role.vip,    // 角色VIP等级
            create_time : Math.floor(role.create/1000), // 创角时间
        });
    }

    ctx.body = {
        code : 0,
        msg : "",
        data : roles
    }
}
