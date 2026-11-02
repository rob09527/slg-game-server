'use strict'
const {ObjectId} = require("mongodb");

function getBuyTime(ctx,VIP) {
    let time = 0;
    let bought = 0;
    if (VIP) {
        let roleVip = ctx.role.vip;
        for (let index = 0; index < VIP.length; index++) {
            let value = VIP[index];
            if (roleVip < value.VIP) return {time, bought};
            bought += (ctx.qxzl.record[index] || 0);
            if (bought < value.LIMIT) {
                time = value.LIMIT - bought;
            }
        }
    }
    return {time, bought};
}

module.exports = exports = async (ctx, next) =>{
   let  player = await ctx.role.getBattleSet('qxzldef');
    let config = ctx.config;
    let buyObj = getBuyTime(ctx,config.VIP)
    ctx.body = {val:ctx.qxzl.val, battle:[], allVal:config.VAL + buyObj.bought, lineup: player && Object.keys(player.team).length > 0, buyTime:buyObj.time};
    if (ctx.request.body.type == 3) {
        ctx.body.val = ctx.role.getProp(config.TICKET);
        ctx.body.allVal = ctx.role.getProp(config.TICKET);
        ctx.body.count = config.COUNT;
        let storey = 0;
        let level = ctx.role.level;
        for (let mapid in config.TEAMID) {
            if (ctx.qxzl.pos <= mapid) break;
            if (level < config.LIMIT[mapid]) break;
            let obj = {};
            obj.level = config.LIMIT[mapid];
            obj.reward = config.REWARD[mapid];
            obj.boss = config.TEAMID[mapid].BOSS.BOSS;
            obj.name = config.REWARDNAME[mapid];

            obj.mopup = true;
            obj.challenge = true;
            obj.local = true;
            obj.mapid = mapid;
            obj.allVal = 0;
            obj.storey = ++storey;
            ctx.body.battle.push(obj);
            
        }
    }
    else {
        for (let mapid in config.LIMIT) {
            let LEVEL = config.LIMIT[mapid];
            let obj = {mapid};
            obj.level = LEVEL;
            obj.reward = config.REWARD[mapid];
            obj.local = (ctx.request.body.type == 1 ? mapid <= ctx.qxzl.pos : mapid < ctx.qxzl.pos) && ctx.role.level >= LEVEL;
            obj.mopup = obj.local && ctx.qxzl.pos > mapid;
            obj.challenge = ctx.request.body.type == 1 ? (obj.local && ctx.qxzl.pos == mapid) : (ctx.qxzl.pos >= mapid);
            obj.boss = config.TEAMID ? config.TEAMID[mapid].BOSS.BOSS : 0;
            obj.name = config.REWARDNAME[mapid];
            if (ctx.request.body.type == 2) {
                obj.mopupReward = config.MOPUP[mapid];
            }
            
            ctx.body.battle.push(obj);
        }
        ctx.body.help = ctx.qxzl.help;

    }
    let teamword = ctx.request.body.type == 2 ? 'qxzlteamid': 'hideteamid';
    let id = ctx.role[teamword];
    id = id == 0 ? "" : id;
    if (ctx.request.body.type > 1 && id) {
        let team = await ctx.dao.c_qxzlteam.findOne({_id:ObjectId(id)});
        if (!team) {
            ctx.role[teamword] = "";
            await ctx.role.save();
            return
        }
        ctx.body.team = await team.base();
    }
}