const businessCode = require("../../../util/businessCode");
const _ = require('lodash');
module.exports = exports = async function (ctx, next) {
    try {
        let {
            serverid,
            page,
        } = ctx.request.body;
        if (page <= 0) {
            ctx.body = ctx.body = { ...businessCode.request_failed }
            return
        }
        let gameservs = Object.values(global.gameservs)
        const game = gameservs[_.random(0, gameservs.length - 1)];
        const roles = await game.remote.findRolesByServerid(serverid, page);
        if (!roles || roles.length === 0) {
            ctx.body = { ...businessCode.success, data: [] }
        }
        let list = []
        let maxpage = roles[0].maxpage
        roles.map(e => {
            let role = {
                level: e.level,
                name: e.name,
                uid: e.uid,
                vip: e.vip,
                create: e.create,
                serverid: e.servid,
                update: e.update,
                legion: e.legion ? e.legion : null,
                legionName: e.legionName ? e.legionName : null,
                rno: e.rno,
                rid: e.rid

            }
            list.push(role)
        })

        ctx.body = {
            ...businessCode.success, data: { maxpage, roles: list }
        }
    } catch (error) {
        console.error(error)
        ctx.body = ctx.body = { ...businessCode.request_failed }
    }

}
