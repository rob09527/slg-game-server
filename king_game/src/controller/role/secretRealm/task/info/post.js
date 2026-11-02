'use strict';

const secretSpirit = require("../../../../../model/secretRealmRole/instance/secretSpirit");
const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

//主线任务
module.exports = async (ctx) => {
    await secretSpirit(ctx)
    const secretRealmRole = ctx.secretRealmRole
    ctx.body = secretRealmRole.task

};
