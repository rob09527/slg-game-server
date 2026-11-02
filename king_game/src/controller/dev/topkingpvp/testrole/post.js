
'use strict'
// 取当前服指定条件的玩家给common插入王者巅峰赛测试数据
module.exports = exports = async (ctx, next) => {
    // 取等级大于60级并且王者阵容为空的账号
    let roles = await ctx.dao.role.find({ 'hide.38001.count': { $gte: 51000000 } })
    for (let role of roles) {
        let generals = await ctx.dao.general.find({ rid: role._id }).hint({rid:1});
        if (generals.length > 1) {
            // 放入到阵容里面
            for (let i = 1; i < 4; i++) {
                if (!role.battlearr.kingpvp+`${i}`) {
                    let obj = {};
                    obj.team = {};
                    if (generals[i - 1]) {
                        obj.team[13] = generals[i - 1]._id.toString();
                        await ctx.dao.role.updateOne({ uid: role.uid,servid:role.servid }, { $set: { [`battlearr.kingpvp${i}`]: obj } });
                    }
                }
            }
        } else {
            if (!role.battlearr.kingpvp1) {
                let obj = {};
                obj.team = {};
                obj.team[13] = generals[0]._id.toString();
                await ctx.dao.role.updateOne({ uid: role.uid ,servid:role.servid }, { $set: { 'battlearr.kingpvp1': obj } });

            }

        }
        // 注册
        await ctx.dao.pvpking.register(role.servid, role.uid, role.i()).catch(console.error);

    }

    ctx.body = {};
}
