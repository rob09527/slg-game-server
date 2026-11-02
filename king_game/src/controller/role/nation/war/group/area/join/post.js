
'use strict'
// 进驻某一个营地
module.exports = exports = async (ctx, next) => {
    let { areamark, set, index, teamid } = ctx.request.body;
    ctx.assert(areamark, 'invalid areamark');
    ctx.assert(set, 'invalid set');
    // 如果set是前军或者后军
    if (set == 'front' || set == 'back') {
        ctx.assert(index, 'invalid index');
    }
    ctx.assert(teamid, 'invalid teamid');
    // 判断是否有布阵
    let bset = await ctx.role.getBattleSet(`nationwar${teamid}`);
    ctx.assert(bset && Object.keys(bset.team).length != 0, 'no bset');
    const joinArea = async (opt) => {
        let { areamark, set, index, teamid, servid, uid } = opt

        // 判断areamark是否包含该servid
        let info = await ctx.dao.nationwar_serverinfo.findOne({ areamark, servers: servid }, {
            [set]: 1
        });
        ctx.assert(info, 'no data');
        // 判断是否已经加入了该队伍
        let user_battleinfo = await ctx.dao.nationwar_battleinfo.findOne({ areamark, servid, uid },
            { c_settlement: 1 }
        );
        if (!user_battleinfo || (user_battleinfo && !user_battleinfo.c_settlement[teamid])) {
            // 不存在，则插入
            let teamList = info[set];
            let teaminfo = teamList[index] ? teamList[index] : teamList;
            // 超过100则抛出
            ctx.assert(teaminfo.length < 100 ,'max team list');
            teaminfo.push({ servid, uid, teamid });
            // 加入
            await ctx.dao.nationwar_serverinfo.joinTeam(servid, uid, areamark, set, index, teamid, teamList)

        } else if (user_battleinfo && user_battleinfo.c_settlement[teamid]) {
            // 存在，并且set index 都相同。则返回已加入
            let teaminfo = user_battleinfo.c_settlement[teamid];
            if (teaminfo == `${set}_${index}`) {
                ctx.assert(false, 'has join');
            } else {
                let result = await ctx.dao.nationwar_serverinfo.removeTeam(servid, uid, areamark, set, index, teamid);
                ctx.assert(result && result.length > 0, 'remove exists team err');
                // 查出当前的队伍信息
                let _info = await ctx.dao.nationwar_serverinfo.findOne({ areamark, servers: servid }, {
                    [set]: 1
                });
                let _teamList = _info[set];
                let _teaminfo = _teamList[index] ? _teamList[index] : _teamList;
                ctx.assert(_teaminfo.length < 100 ,'max team list');
                _teaminfo.push({ servid, uid, teamid });
                // 加入
                await ctx.dao.nationwar_serverinfo.joinTeam(servid, uid, areamark, set, index, teamid, _teamList)
            }
        }
        console.log('NATIONWAR_JOIN', servid, uid, areamark, set, index, teamid, new Date().toLocaleString())
    }

    await joinArea({
        areamark,
        set,
        index,
        teamid,
        servid: ctx.role.servid,
        uid: ctx.role.uid
    })

    //  通知本轮国战所有区服
    let groups = await ctx.dao.nationwar_serverinfo.findGroupidsByAreamark(areamark);
    if (groups && groups.length > 0) {
        groups.forEach(g => {
            // 告诉客户端刷新页面
            global.remote.pushClientAll(g, {
                type: 'nationwar', // 刷新国战信息
                content: { 'refresh_info': 1 }
            });
        })
    }
    // 入驻
    ctx.body = {};
}