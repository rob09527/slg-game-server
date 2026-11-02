const initSecret = require("../../../model/secretRealmRole/instance/initSecret")
const secretSpirit = require("../../../model/secretRealmRole/instance/secretSpirit")
const secretTask = require("../../../model/secretRealmRole/instance/secretTask")
module.exports = exports = async (ctx, next) => {
    const level = ctx.role.level - ctx.role.getItems(99567).count;
    if (level > 0) {
        await secretTask(ctx, 99567, level)
    }

    await initSecret(ctx)
    await secretSpirit(ctx)
    await next()
}