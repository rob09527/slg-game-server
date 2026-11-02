//巅峰赛测试。用完过后屏蔽或者删除
'use strict'
const _ = require('lodash');
const ms = require('ms');
// 创建测试账号
module.exports = async function (action) {
    if (action == 'delete') {
        await deletedfssj()
        return true
    }
    const type = 3
    const usernum = 60
    const serverstest = await global.dao.gameserver.find({});
    const sMap = {};
    let servers = []
    serverstest.forEach(s => {
        sMap[s.servid] = s;
        servers.push(s.servid)
    })
    for (let servid of servers) {
        for (let i = 0; i < usernum; i++) {
            let trole;
            let g_gsids;
            if (type == 0) {
                trole = global.dao.role(global.gameconfig.testrole0.role)
                trole.pvpscore = 10000; // 竞技场分数
                g_gsids = global.gameconfig.testrole0.general || [12021]
            } else if (type == 1) {
                trole = global.dao.role(global.gameconfig.testrole1.role)
                trole.pvpscore = 5000;// 竞技场分数
                g_gsids = global.gameconfig.testrole1.general || [12021]
            } else if (type == 2) {
                trole = global.dao.role(global.gameconfig.testrole2.role)
                g_gsids = global.gameconfig.testrole2.general || [12021]
            } else if (type == 3) {
                trole = global.dao.role(global.gameconfig.testrole1.role)
                trole.pvpscore = _.random(1000, 1010);// 竞技场分数
                g_gsids = global.gameconfig.testrole1.general || [12021]
            }
            let LIMIT = global.gameconfig.deftiny.COST.LIMIT;
            trole.destiny = {
                val: 0,
                general: [],
                temprefersh: {},
                refersh: [LIMIT, LIMIT, LIMIT]
            }
            trole.uid = 'testrole' + _.random(1000000, 100000000).toString() + Date.now().toString().slice(-3) + i;
            trole.rname = 'trole' + Date.now().toString().slice(-3)
            trole.servid = servid
            trole.rno = await global.dao.role.getLastRno();
            trole.rno++;
            await trole.save();
            let rankService = new global.services.RankService('pvp', sMap[servid].groupid);


            // 给玩家加武将
            for (let gsid of g_gsids) {
                let g = await global.dao.general.newGeneralNoSave(trole.i(), gsid);
                await g.save();
            }
            // 设置normal、pvpdef、kingpvp1 阵容
            let generals = await global.dao.general.find({ rid: trole.i() }).hint({ rid: 1 });
            if (generals.length > 1) {
                if (!trole.battlearr.kingpvp1) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await global.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.kingpvp1': obj } });
                }
                if (!trole.battlearr.pvpdef) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await global.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.pvpdef': obj } });
                }
                if (!trole.battlearr.normal) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await global.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.normal': obj } });
                }
                if (!trole.battlearr.topkingpvp1) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await global.dao.role.updateOne({ uid: trole.uid, servid: trole.servid }, { $set: { 'battlearr.topkingpvp1': obj } });
                }
                await rankService.set({
                    id: trole.i(),
                    score: trole.pvpscore
                });
            }
        }
    }
    return true
}
async function deletedfssj() {
    const serverstest = await global.dao.gameserver.find({});
    const sMap = {};
    let servers = []
    serverstest.forEach(s => {
        sMap[s.servid] = s;
        servers.push(s.groupid)
    })
    await global.dao.topking.deleteMany()
    await global.dao.topkingrecord.deleteMany()
    await global.dao.topkingrank.deleteMany()
    for (let groupid of servers) {
        let type = 'pvp';
        let REDIS_KEY = `KING:RANK:${type}`;
        REDIS_KEY = `${REDIS_KEY}:${groupid}`;
        await global.redis.del(REDIS_KEY);
    }

}