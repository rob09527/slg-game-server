
'use strict'
// 撤回已经入驻的小队
const ms = require('ms');
module.exports = exports = async (ctx, next) => {
    const { MOVE_TEAM_INTERVAL: team_inteval = 1 } = global.gameconfig.nationwar.BASE;
    let { teamid } = ctx.request.body;
    ctx.assert(teamid > 0, 'invalid teamid');
    let info = ctx.nation_match;
    ctx.assert(info, 'invalid nation info');
    ctx.assert(info.state == 1 && Date.now() < info.nextroundtime - ms(`${team_inteval}h`), 'invalid withdraw time');
    const withdrawTeam = async (opt) => {
        const {
            servid,
            uid,
            teamid
        } = opt
        console.log('NATIONWAR_WITHDRAW', servid, uid, teamid, new Date().toLocaleString());
        let areamark = await ctx.dao.nationwar_serverinfo.findAreamarkByServid(servid);
        ctx.assert(areamark, 'no data');

        // 撤回队伍
        let userInfo = await ctx.dao.nationwar_battleinfo.findOne({ areamark, servid, uid }, { c_settlement: 1, c_battlesetstate: 1 })
        ctx.assert(userInfo && userInfo.c_settlement[teamid], 'no bset data');
        // 获取队伍所在阵营
        let c_settlement = userInfo.c_settlement;
        let c_battlesetstate = userInfo.c_battlesetstate;
        let result;
        if (c_settlement[teamid] == 'pre') {
            result = await ctx.dao.nationwar_serverinfo.removeTeam(servid, uid, areamark, c_settlement[teamid], null, teamid);
        } else {
            // 判断所在阵营
            let [set, index] = c_settlement[teamid].split('_');
            // 移除入驻后的队伍
            result = await ctx.dao.nationwar_serverinfo.removeTeam(servid, uid, areamark, set, index, teamid);
        }
        console.log('NATIONWAR_WITHDRAW_RESULT', servid, uid, result, new Date().toLocaleString());

        ctx.assert(result && result.length > 0, 'remove exists team err');
        // 删除入驻信息
        delete c_settlement[teamid];
        delete c_battlesetstate[teamid];
        userInfo.c_settlement = c_settlement;
        userInfo.c_battlesetstate = c_battlesetstate;
        userInfo.markModified('c_settlement');
        userInfo.markModified('c_battlesetstate');
        await userInfo.save();
    }
    await withdrawTeam({
        servid: ctx.role.servid,
        uid: ctx.role.uid,
        teamid
    });
    let _areamark = await ctx.dao.nationwar_serverinfo.findAreamarkByServid(ctx.role.servid);
    //  通知本轮国战所有区服
    let groups = await ctx.dao.nationwar_serverinfo.findGroupidsByAreamark(_areamark);
    if (groups && groups.length > 0) {
        groups.forEach(g => {
            // 告诉客户端刷新页面
            global.remote.pushClientAll(g, {
                type: 'nationwar', // 刷新国战信息
                content: { 'refresh_info': 1 }
            });
        })
    }
    ctx.body = { result: 'ok' };
}