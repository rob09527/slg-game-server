const businessCode = require("../../../util/businessCode");

module.exports = exports = async function (ctx, next) {
    try {
        let {
            serverid,
            date,
        } = ctx.request.body;
        const data = await global.remote.getOnlineReport(serverid, date);
        ctx.body = { ...businessCode.success, data: data[0] }
    } catch (error) {
        console.error(error)
        ctx.body = ctx.body = { ...businessCode.request_failed }
    }

}
