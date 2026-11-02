//'use strict'
//越南h5新api
const _ = require('lodash');
/**
 * 根据uid 去获取所有服务器的角色信息
 * @param ctx
 * @param next
 * @return {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let {
        clientIP,
        roleID,
        ts,
        sig,
    } = ctx.request.body;
    try {
        let gameservs = Object.values(global.gameservs)
        const game = gameservs[_.random(0, gameservs.length - 1)];

        const list = global.CACHE.gameserver.list
        let server = {}
        for (let x in list) {
            server[x] = list[x].name
        }
        const role = await game.remote.findRolesByRno(roleID);

        if (!role) {
            let data = {
                "returnCode": -1,
                "returnMessage": "roleID error",
            }
            ctx.body = data
            return;
        }
        const roleMap = {};

        roleMap[role.rno] = {
            "roleID": role.rno,
            "roleName": role.name,
            "userID": role.uid,
            "serverID": role.servid,
            "serverName": server[role.servid],
            "info": {
                "level": role.level,
                "power": role.power
            }

        };



        let data = {
            "returnCode": 1,
            "returnMessage": "success",
            "data": roleMap

        }
        ctx.body = data
    } catch (error) {
        console.error("GetRolesByRoleID", error)
        let data = {
            "returnCode": -1,
            "returnMessage": "sql error",
        }
        ctx.body = data
    }

}