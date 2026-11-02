'use strict';

const incrAndExpire = require("../../../../../util/incrAndExpire");

//信息下发给客户端

module.exports = async (ctx) => {
    let {
        rid,
    } = ctx.request.body;


    ctx.role.addItemsNoSave([{ gsid: 111111, count: 3 }, { gsid: 111112, count: 2 }]);
    await ctx.role.save()
    let _role = await ctx.dao.role.findOne({ _id: rid })
    if (!_role) {
        throw ('null role')
    }
    const player = await _role.getBattleSet('normal');

    ctx.body = player;
};


