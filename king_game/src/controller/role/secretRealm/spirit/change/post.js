'use strict';

const updateSpirit = require("../../../../../model/secretRealmRole/instance/updateSpirit");
//切换宠物
module.exports = async (ctx) => {
    const { id } = ctx.request.body;
    await updateSpirit(ctx, id)
    ctx.body = "success"
};
