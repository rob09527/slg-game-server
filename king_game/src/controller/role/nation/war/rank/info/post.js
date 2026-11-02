
'use strict'
// 国战-排行
module.exports = exports = async (ctx, next) => {
    let { areamark } = ctx.request.body;
    ctx.assert(areamark, 'invalid areamark');
    // 打印执行时间
    let timeprint_prefix = [ctx.path, ctx.role.uid, ctx.role.servid].join('_');
    // 打印执行时间
    console.time(timeprint_prefix + '_req');
    let __cmnwai = timeprint_prefix + '_cmnwai';
    console.time(__cmnwai);
    const rankInfo = async (opt) => {
        const {
            areamark,
            servid,
            uid
        } = opt
        let g_mark = await ctx.dao.nationwar_serverinfo.findGroupmarkByAreamark(areamark);
        ctx.assert(g_mark, 'no data');
        // 查组别信息
        // 跨服组下的服务器信息
        let serversInfo = await ctx.dao.nationwar_serverinfo.find(
            { groupmark: g_mark },
            {
                areamark: 1,
                servid: 1,
                servers: 1,
                groupmark: 1,
                front: 1,
                back: 1,
                infield: 1,
                pre: 1,
                position: 1,
                wincount: 1,
                icon: 1,
                name: 1,
                standings: 1,
                kingname: 1
            }).sort({ position: 1 });
        // 取出整个组的areamark
        let areamarks = serversInfo.map(data => data.areamark)
        // 个人击杀排行
        let myserverInfo = await ctx.dao.nationwar_battleinfo.find({ areamark: { $in: areamarks } }, {
            servid: 1,
            uid: 1,
            c_totalpower: 1,
            wincount: 1
        }).sort({ wincount: -1, c_totalpower: -1 }).limit(50);
        // 个人
        let my = await ctx.dao.nationwar_battleinfo.findOne({ areamark, servid, uid }, {
            servid: 1,
            uid: 1,
            c_totalpower: 1,
            wincount: 1
        })
        return {
            serversInfo,
            myserverInfo,
            my: {
                servid, uid,
                c_totalpower: my ? my.c_totalpower : 0,
                wincount: my ? my.wincount : 0,
            }
        };
    };
    ctx.body = {};
    // 缓存5分钟
    ctx.body = await global.services.WangpvpService.find("nation:rank_body:" + `${areamark}_${ctx.role.servid}_${ctx.role.uid}`);
    if (!ctx.body || Object.keys(ctx.body).length == 0) {
        ctx.body = {};
        let info = await rankInfo({
            areamark,
            servid: ctx.role.servid,
            uid: ctx.role.uid
        })

        console.timeEnd(__cmnwai);
        let __tinfoall = timeprint_prefix + '_nation';
        console.time(__tinfoall);
        let __counter = 0;
        let servers = [];
        let user = [];
        // 国家击杀排行
        if (info && info.serversInfo) {
            let server_ranks = info.serversInfo;
            for (let rank of server_ranks) {
                __counter++;
                let __tinfo = [timeprint_prefix, __counter].join('_');
                console.time(__tinfo);
                let kingname;
                // 取国王名字
                let kingrid = rank.standings[0];
                if (kingrid) {
                    let userinfo = await ctx.dao.role.getOtherInfoAndBattleSet({ rid: kingrid }, 'nationwar');
                    if (userinfo) kingname = userinfo.rname;
                }
                console.timeEnd(__tinfo);
                // 统计队伍数量
                let teamnum = 0;
                if (Object.keys(rank.front).length >= 2) {
                    teamnum += Object.keys(rank.front.left).length;
                    teamnum += Object.keys(rank.front.right).length;
                }
                if (Object.keys(rank.back).length >= 2) {
                    teamnum += Object.keys(rank.back.left).length;
                    teamnum += Object.keys(rank.back.right).length;
                }

                // 封装返回数据
                let obj = {
                    kingname, // 国王名
                    areamark: rank.areamark,
                    servid: rank.servid,
                    icon: rank.icon,
                    name: rank.name,
                    wincount: rank.wincount,
                    teamnum
                };
                servers.push(obj)
            }
        }
        console.timeEnd(__tinfoall);

        let __usersinfo = timeprint_prefix + '_user';
        console.time(__usersinfo);
        let user_count = 0;
        // 个人击杀排行
        if (info && info.myserverInfo) {
            let ranks = info.myserverInfo;
            for (let role of ranks) {
                user_count++
                let __tinfo = [timeprint_prefix, role.servid, role.uid, user_count].join('_');
                console.time(__tinfo);
                let others = {};
                others.servid = role.servid;
                others.uid = role.uid;
                let userinfo = await ctx.dao.role.getOtherInfoAndBattleSet(others, 'nationwar');
                if (userinfo) {
                    user.push({
                        ...userinfo, c_totalpower: role.c_totalpower,
                        wincount: role.wincount
                    });
                }
                console.timeEnd(__tinfo);
            }

        }
        console.timeEnd(__usersinfo);

        let userinfo = await ctx.dao.role.getOtherInfoAndBattleSet({
            servid: ctx.role.servid,
            uid: ctx.role.uid
        }, 'nationwar');

        let my = { ...userinfo, ...info.my };

        console.timeEnd(timeprint_prefix + '_req');

        ctx.body = {
            servers,
            user,
            my // 个人击杀
        };
        await global.services.WangpvpService.set("nation:rank_body:" + `${areamark}_${ctx.role.servid}_${ctx.role.uid}`, ctx.body, 5 * 60);
    }

}