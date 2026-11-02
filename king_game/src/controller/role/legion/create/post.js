'use strict'

const chkcontent = require("../../../../util/chkcontent")
const h5post = require("../../../../util/h5post")

module.exports = exports = async (ctx, next) => {
    ctx.assert(!ctx.role.legion, 'already join');
    ctx.assert(ctx.role.level >= 18, 'lv limit');
    const { CREATECASTYB } = global.gameconfig.others.LEGION;
    const legionFlag = global.gameconfig.legionflag;
    // 新创建军团 清除阵营信息
    await ctx.dao.role.updateOne({ _id: ctx.role._id }, {
        $unset: {
            "battlearr.legionpvp1.camp": 1,
            "battlearr.legionpvp2.camp": 1
        }
    });
    ctx.role.castItemsNoSave({ gsid: 38005, count: CREATECASTYB }, { main: 'legion', sec: 'create' });
    const { name, notice, minlv, ispass, flag = 0 } = ctx.request.body;
    const chk = await chkcontent(ctx.role, 1, name);
    ctx.assert(chk, "invalid string");
    let legion = await ctx.dao.legion.findOne({ name });
    ctx.assert(!legion, 'name duplicate');
    // @awko 新增 军团战旗
    ctx.assert(legionFlag[flag] && legionFlag[flag].LEVEL_LIMIT === 0, 'flag lv limit');
    legion = new ctx.dao.legion({ servid: ctx.role.servid });
    legion.name = name;
    legion.flag = flag;
    legion.notice = notice || '';
    legion.minlv = minlv;
    legion.ispass = parseInt(ispass) ? true : false;
    legion._members.push({ rid: ctx.role.i(), pos: 2 });
    ctx.role.legion = legion._id;
    ctx.role.legionName = legion.name;

    ctx.role.legionjointime = Date.now();
    ctx.role.missionInvoke('LEGION_JOIN');
    ctx.body = { id: legion._id.toString() };
    ctx.dao.lboss.create({ legion: legion._id }).catch(console.error);

    const legionroom = `legion_` + ctx.role.legion;
    // 加入军团房间
    global.socketRedis.joinRoom(ctx.role.i(), legionroom);

    await ctx.role.save();
    await legion.save();
}
