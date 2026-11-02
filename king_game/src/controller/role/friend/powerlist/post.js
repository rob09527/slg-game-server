
'use strict'
// 好友战力排行
module.exports = exports = async function (ctx, next) {

    let friend = [];
    // 遍历该玩家的好友信息
    for (let i = 0; i < ctx.role.friends.length; i++) {
        let obj = {};
        let friendInfo = await ctx.dao.role.findOne({ _id: ctx.role.friends[i] });
        if (!friendInfo) continue;// 不存在
        // 取出玩家的阵容信息
        obj.iconid = friendInfo.iconid;
        obj.frameid = friendInfo.frameid;
        obj.headid = friendInfo.headid;
        obj.rname = friendInfo.name;
        obj.sex = friendInfo.sex;
        obj.id = ctx.role.friends[i];
        obj.level = friendInfo.level;
        obj.power = friendInfo._power;
        friend.push(obj);
    }

    // 战力
    friend = friend.sort((a, b) => {
        return b.power - a.power;
    });
    ctx.body = friend;
}
