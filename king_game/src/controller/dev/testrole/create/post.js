
'use strict'

const { curl } = require('urllib');
const _ = require('lodash');

const ms = require('ms');
// 创建测试账号
module.exports = exports = async (ctx, next) => {
    let {
        type = 0,
        servers = [],
        usernum = 0
    } = ctx.request.body;
    ctx.assert(servers.length > 0, 'invalid servid');
    ctx.assert(usernum > 0, 'invalid usernum');
    const serverstest = await ctx.dao.gameserver.find({});
    const sMap = {};
    serverstest.forEach(s => {
        sMap[s.servid] = s;
    })

    for (let servid of servers) {
        for (let i = 0; i < usernum; i++) {
            let trole;
            let g_gsids;
            if (type == 0) {
                trole = new ctx.dao.role(global.gameconfig.testrole0.role)
                trole.pvpscore = 10000; // 竞技场分数
                g_gsids = global.gameconfig.testrole0.general || [12021]
            } else if (type == 1) {
                trole = new ctx.dao.role(global.gameconfig.testrole1.role)
                trole.pvpscore = 5000;// 竞技场分数
                g_gsids = global.gameconfig.testrole1.general || [12021]
            } else if (type == 2) {
                trole = new ctx.dao.role(global.gameconfig.testrole2.role)
                g_gsids = global.gameconfig.testrole2.general || [12021]
            } else if (type == 3) {
                trole = new ctx.dao.role(global.gameconfig.testrole1.role)
                trole.pvpscore = _.random(1000, 1005);// 竞技场分数
                g_gsids = global.gameconfig.testrole1.general || [12021]
            }
            let LIMIT = global.gameconfig.deftiny.COST.LIMIT;
            trole.destiny = {
                val: 0,
                general: [],
                temprefersh: {},
                refersh: [LIMIT, LIMIT, LIMIT]
            }




            trole.uid = 'testrole' + Date.now().toString().slice(-3) + i;
            trole.rname = 'trole' + Date.now().toString().slice(-3)
            trole.servid = servid
            trole.rno = await ctx.dao.role.getLastRno();
            trole.rno++;
            await trole.save();
            let result = await ctx.dao.gameserver.find({ servid: servid })
            console.log(result._groupid, "==1112===", sMap[servid].groupid)
            let rankService = new global.services.RankService('pvp', sMap[servid].groupid);

            await rankService.set({
                id: trole.i(),
                score: trole.pvpscore
            });
            // 给玩家加武将
            for (let gsid of g_gsids) {
                let g = await ctx.dao.general.newGeneralNoSave(trole.i(), gsid);
                await g.save();
            }
            // 设置normal、pvpdef、kingpvp1 阵容
            let generals = await ctx.dao.general.find({ rid: trole.i() }).hint({ rid: 1 });
            if (generals.length > 1) {
                if (!trole.battlearr.kingpvp1) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await ctx.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.kingpvp1': obj } });
                }
                if (!trole.battlearr.pvpdef) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await ctx.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.pvpdef': obj } });
                }
                if (!trole.battlearr.normal) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await ctx.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.normal': obj } });
                }
                if (!trole.battlearr.topkingpvp1) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await ctx.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.topkingpvp1': obj } });
                }
            }
        }

    }




    ctx.body = {};
}



