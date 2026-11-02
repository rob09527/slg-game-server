'use strict';

//收集被攻击用户信息
//需要客户端在点击问鼎九州的时候主动汇报数据
module.exports = async (ctx) => {
    ctx.body = 'success'
    let rno = ctx.role.rno;
    let servid = ctx.role.servid
    let rid = ctx.role.rid;
    let attacktered = {
        rno,
        servid,
        rid: rid
    }
    let count = await global.dao.wdjzattacker.count({ servid })
    console.log(global.gameconfig.secretRealmWdjz[1][0].TOTALNUM, new Date().getTime())
    if (count <= global.gameconfig.secretRealmWdjz[1][0].TOTALNUM) {
        try {
            await global.dao.wdjzattacker.create(attacktered)
        } catch (error) {
            // console.warn("挑战用户已经存在", error.errmsg)
        }
    } else if (count > global.gameconfig.secretRealmWdjz[1][0].TOTALNUM) {
        //重置
        await global.dao.wdjzattacker.deleteMany({ servid: servid });
    } else {
        let time = Date.now() - 1000 * 60 * 60 * global.gameconfig.secretRealmWdjz[1][0].TIME
        await global.dao.wdjzattacker.updateOne({ update: { $lte: time }, servid }, attacktered);
    }
};
