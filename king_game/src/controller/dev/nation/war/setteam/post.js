
'use strict'
// 国战-批量给玩家创建国战阵容
// 国战-批量加入阵营。
module.exports = exports = async (ctx, next) => {
    // !！默认已经有国战分组信息。并且已经分好战区
    // 查areamark 
    // 查这个下面的玩家
    let nation_servers = await ctx.dao.nationwar_serverinfo.find({ groupmark: { $exists: 1 }, isout: 0 }, { servers: 1, areamark: 1 })
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
                _teaminfo.push({ servid, uid, teamid });
                // 加入
                await ctx.dao.nationwar_serverinfo.joinTeam(servid, uid, areamark, set, index, teamid, _teamList)
            }
        }
        console.log('NATIONWAR_JOIN', servid, uid, areamark, set, index, teamid, new Date().toLocaleString())
    }

    for (let nation of nation_servers) {
        let servers = nation.servers;
        // 取等级大于40级并且国战阵容为空的账号
        let roles = await ctx.dao.role.find({ servid: { $in: servers }, 'hide.38001.count': { $gte: 3000000 } }, { servid: 1, battlearr: 1, uid: 1 })
        for (let role of roles) {
            let generals = await ctx.dao.general.find({ rid: role._id }).hint({rid:1});
            if (generals.length > 1) {
                // 放入到阵容里面
                for (let i = 1; i < 4; i++) {
                    if (!role.battlearr.nationwar + `${i}`) {
                        let obj = {};
                        obj.team = {};
                        if (generals[i - 1]) {
                            obj.team[13] = generals[i - 1]._id.toString();
                            await ctx.dao.role.updateOne({ uid: role.uid, servid: role.servid }, { $set: { [`battlearr.nationwar${i}`]: obj } });
                        }
                    }
                }
            } else {
                if (!role.battlearr.nationwar1) {
                    let obj = {};
                    obj.team = {};
                    obj.team[13] = generals[0]._id.toString();
                    await ctx.dao.role.updateOne({ uid: role.uid, servid: role.servid }, { $set: { 'battlearr.nationwar1': obj } });

                }

            }
            // 随机去前军或者后军
            let num = Math.round(Math.random() * 10);
            if (num > 5) {
                let cnum = Math.round(Math.random() * 10);
                try {
                    await joinArea({
                        areamark: nation.areamark,
                        set: "front",
                        index: cnum > 5 ? "left" : "right",
                        teamid: 1,
                        servid: role.servid,
                        uid: role.uid
                    });
                } catch (error) {
                    console.error(error);
                    continue
                }

            } else {
                let cnum = Math.round(Math.random() * 10);
                try {
                    await joinArea({
                        areamark: nation.areamark,
                        set: "back",
                        index: cnum <= 5 ? "left" : "right",
                        teamid: 1,
                        servid: role.servid,
                        uid: role.uid
                    });
                } catch (error) {
                    console.error(error);
                    continue;
                }

            }
        }
    }


    ctx.body = { result: "ok" };
}