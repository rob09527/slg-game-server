'use strict';

const initSecret = require("../../../../model/secretRealmRole/instance/initSecret");
const secretSpirit = require("../../../../model/secretRealmRole/instance/secretSpirit");




module.exports = async (ctx) => {
    await initSecret(ctx)
    ctx.body = await secretSpirit(ctx)
};
