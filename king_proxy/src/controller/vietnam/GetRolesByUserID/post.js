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
        userID,//这个地方应该对应的是我们游戏的uid,
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

        const roles = await game.remote.findRolesByUid(userID);
        if (!roles || roles.length == 0) {
            let data = {
                "returnCode": -1,
                "returnMessage": "userID error",
            }
            ctx.body = data
            return;
        }
        const roleMap = {};
        roles.forEach(role => {
            roleMap[role.rno] = {
                "roleID": role.uid,
                "roleName": role.name,
                "userID": role.rno,
                "serverID": role.servid,
                "serverName": server[role.servid],
                "info": {
                    "level": role.level,
                    "power": role.power
                }

            };

        });

        let data = {
            "returnCode": 1,
            "returnMessage": "success",
            "data": roleMap

        }
        ctx.body = data
    } catch (error) {
        console.error("GetRolesByUserID", error)
        let data = {
            "returnCode": -1,
            "returnMessage": "sql error",
        }
        ctx.body = data
    }

}