
'use strict'
// 国战-战场信息
module.exports = exports = async (ctx, next) => {
    ctx.body = {}
    let { road = [] } = ctx.request.body;
    ctx.assert(road.length > 0, 'invalid road');
    // 打印执行时间
    let timeprint_prefix = [ctx.path, ctx.role.uid, ctx.role.servid].join('_');
    // 打印执行时间
    console.time(timeprint_prefix + '_req');

    let __cmnwai = timeprint_prefix + '_cmnwai';
    console.time(__cmnwai);
    let getInfield = async (opt) => {
        let { road = [] } = opt;
        ctx.assert(road.length > 0, 'invalid road');
        let info = await ctx.dao.nationwar_serverinfo.findGroupmarkByAreamark(road[0]);
        ctx.assert(info, 'no data');
        // 查组别信息
        let nation = await ctx.dao.nationwar_match.findOne(
            { groupmark: info },
            { round: 1, nexttime: 1, state: 1, groupmark: 1 });
        // 跨服组下的服务器信息
        let serversInfo = await ctx.dao.nationwar_serverinfo.find(
            { groupmark: info, isout: { $in: [0, nation.round] } },
            {
                areamark: 1,
                servid: 1,
                groupmark: 1,
                maxhp: 1,
                nowhp: 1,
                front: 1,
                back: 1,
                infield: 1,
                position: 1,
                leftatkcity: 1,
                rightatkcity: 1,
                kingname: 1
            }).sort({ position: 1 });

        // 返回战报
        let reportInfo = await ctx.dao.nationwar_record.findOne({ groupmark: info, areastand: `${road[0]}_${road[1]}` }, { report: 1 });
        return {
            serversInfo,
            nation,
            report: reportInfo && reportInfo.report ? reportInfo.report : { left: [], right: [] }
        };
    }
    let info = await getInfield({ road });
    ctx.assert(info.serversInfo.length > 0, 'no server info');
    console.timeEnd(__cmnwai);

    // 判断两者是否是对战关系
    let servers = info.serversInfo;
    let leftindex = servers.findIndex((server) => server.areamark == road[0]);
    ctx.assert(leftindex != -1, 'no left server info');
    let rightindex = servers.findIndex((server) => server.areamark == road[1]);
    ctx.assert(rightindex != -1, 'no right server info');

    // 是否是前后对战关系
    ctx.assert(leftindex + 1 == rightindex || (servers[0].areamark == road[1] && servers[servers.length - 1].areamark == road[0]), 'no relation');
    // 获取下一个时间段对战时间
    let nexttime = info.nation.nexttime;
    let areamarks = {};
    let ground = {}
    for (let i = 0; i < road.length; i++) {
        let areainfo = servers.find((server) => server.areamark == road[i]);
        // 整理数据
        areamarks[road[i]] = {
            servid: areainfo.servid,
            winnum: areainfo.winnum,
            nowhp: areainfo.nowhp,
            maxhp: areainfo.maxhp
        }
        if (i == 0) {
            areamarks[road[i]].front = {
                left: {
                    max: areainfo.front.left.length,
                    alive: areainfo.front.left.length - areainfo.front.leftindex || 0
                },
                right: {
                    max: areainfo.front.right.length,
                    alive: areainfo.front.right.length - areainfo.front.rightindex || 0
                }
            }
        } else {
            areamarks[road[i]].back = {
                left: {
                    max: areainfo.back.left.length,
                    alive: areainfo.back.left.length - areainfo.back.leftindex || 0
                },
                right: {
                    max: areainfo.back.right.length,
                    alive: areainfo.back.right.length - areainfo.back.rightindex || 0
                }
            }
        }
        // 战场
        let infileds = areainfo.infield.toObject();
        let __tinfoall = timeprint_prefix + '_tall';
        console.time(__tinfoall);
        let __counter = 0;
        for (let way in infileds) {
            let inner = infileds[way];
            for (let _userinfo in inner) {
                let userList = inner[_userinfo];
                if (typeof userList == 'number') continue;
                for (let user of userList) {
                    __counter++;
                    let __tinfo = [timeprint_prefix, user.uid, user.servid, __counter].join('_');
                    console.time(__tinfo);
                    let userinfo = await ctx.dao.role.getOtherInfoAndBattleSet({ uid: user.uid, servid: user.servid }, 'nationwar');
                    user.rname = userinfo.rname;
                    user.rid = userinfo.rid;
                    user.level = userinfo.level;
                    user.general = {};
                    if (userinfo.battleset[user.teamid]) {
                        let bset = userinfo.battleset[user.teamid];
                        if (Object.keys(bset.team).length < 1) continue;
                        // 获取第一个武将
                        const g = Object.values(bset.team)[0];
                        user.general = {
                            general: { guid: g.guid, class: g.class, level: g.level, skin: g.skin, gsid: g.gsid },
                            teampower: userinfo.teampower[user.teamid]
                        }
                    }
                    console.timeEnd(__tinfo);
                }
            }
        }
        console.timeEnd(__tinfoall);
        ground[road[i]] = areainfo.infield;

    }
    // 打印执行时间
    console.timeEnd(timeprint_prefix + '_req');
    ctx.body = {
        areamarks,
        ground,
        nexttime,
        report: info.report
    };

}