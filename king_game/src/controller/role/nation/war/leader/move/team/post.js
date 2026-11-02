
'use strict'
// 指挥官移动队伍
const MOVE_TEAM_CACHE = {};
const MOVE_TEAM_CACHE_TIME = 10000; //10s
module.exports = exports = async (ctx, next) => {
    let { set, index, areamark, team = [] } = ctx.request.body;
    ctx.assert(set, 'invalid set');
    ctx.assert(index, 'invalid index');
    ctx.assert(areamark, 'invalid areamark');
    ctx.assert(team && team.length > 0, 'invalid team');
    ctx.assert(ctx.nation_state == 1 || (ctx.nation_state == 2 && parseInt(team[0]) > 5 && parseInt(team[1]) > 5), 'invalid pos');
    // 设置请求cd
    /**
    *  {
    *  'servid_uid':{'1':时间戳}
    * }
    */
    const moveTeam = async (opt) => {
        let { set, index, areamark, team, servid, uid } = opt
        console.log('NATIONWAR_MOVE_TEAM', servid, uid, set, index, areamark, team, new Date().toLocaleString())
        const info = await ctx.dao.nationwar_serverinfo.findOne({ areamark }, { [set]: 1 });
        ctx.assert(info, 'no data');
        let teamInfo = info[set];
        if (index) {
            // 有前后军
            // 左军或者右军
            let first = teamInfo[index][team[0]];
            let second = teamInfo[index][team[1]];
            ctx.assert(first, 'first data no exists1');
            ctx.assert(second, 'second data no exists1');
            console.log('NATIONWAR_MOVE_TEAM_INFO_INDEX', servid, uid, first, second, new Date().toLocaleString());
            // 解构赋值
            [first, second] = [second, first];
            teamInfo[index][team[0]] = first;
            teamInfo[index][team[1]] = second;
        } else {
            let first = teamInfo[team[0]];
            let second = teamInfo[team[1]];
            ctx.assert(first, 'first data no exists2');
            ctx.assert(second, 'second data no exists2');
            console.log('NATIONWAR_MOVE_TEAM_INFO', servid, uid, first, second, new Date().toLocaleString());
            // 解构赋值
            [first, second] = [second, first];
            teamInfo[team[0]] = first;
            teamInfo[team[1]] = second;
        }
        await ctx.dao.nationwar_serverinfo.updateOne({ areamark }, { $set: { [set]: teamInfo } })
    }

    const cacheinfo = MOVE_TEAM_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] || {};
    if (!cacheinfo[`${team[0]}_${team[1]}`] || Date.now() - cacheinfo[`${team[0]}_${team[1]}`] > MOVE_TEAM_CACHE_TIME) {
        //记录
        cacheinfo[`${team[0]}_${team[1]}`] = Date.now();
        MOVE_TEAM_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] = cacheinfo;
        // team两个值。每个值大于出场index+3
        await moveTeam({
            set, index, areamark, team,
            servid: ctx.role.servid,
            uid: ctx.role.uid
        })
        // 移除cd
        delete cacheinfo[`${ctx.role.servid}_${ctx.role.uid}`];
        MOVE_TEAM_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] = cacheinfo;
    } else {
        ctx.assert(false, 'cd time');
    }



    ctx.body = { result: "ok" };
}