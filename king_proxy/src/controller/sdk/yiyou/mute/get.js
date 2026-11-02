'use strict'
const {isValidObjectId} = require('mongoose');

module.exports = exports = async function (ctx, next) {
    ctx.body = {
        code : 0,
        msg : "success",
    }

    let {
        sign,
        type,
        user_id,
        role_id,
        time
    } = ctx.request.query;
    ctx.assert(ctx.h5postfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

    const uid = ctx.channel + user_id;

    if(isValidObjectId(role_id)){
        con._id = role_id;
    }
    else{
        con.rno = +role_id;
    }
    const role = await global.remote.agent_findrole(con);
    if(!role) { // 角色不存在
        ctx.body.msg = "role nexist"
        return;
    }
    if(role.uid != uid){
        ctx.body.msg = "uid error"
        return;
    }

    const servid = role.servid;

    // 1:禁言，2:解封
    if (type == 2) {
        return await global.remote.agent_unmute_role({uid, servid: servid});
    }
    const hour = Number(time) == 0 ? 3600 * 24 * 365 * 100 : time; //秒
    const mute = await global.remote.agent_ismute({uid, servid: servid});

    if(mute) { // 已经禁言
        ctx.body.msg = "role is mute"
        return;
    }

    return await global.remote.agent_mute_role({uid, servid: servid}, hour);


}
