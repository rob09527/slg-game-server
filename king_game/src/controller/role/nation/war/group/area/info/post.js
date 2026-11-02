
'use strict'
// 获取玩家所在战区的某个营地的队伍信息
module.exports = exports = async (ctx, next) => {
    let { areamark, set, index } = ctx.request.body;
    ctx.assert(areamark, 'invalid areamark');
    ctx.assert(set, 'invalid set');
    let timeprint_prefix = [ctx.path, ctx.role.uid, ctx.role.servid].join('_');
    // 打印执行时间
    console.time(timeprint_prefix + '_req');

    // 如果set是前军或者后军
    if (set == 'front' || set == 'back') {
        ctx.assert(index, 'invalid index');
    }
    let __cmnwai = timeprint_prefix + '_cmnwai';
    console.time(__cmnwai);

    const getAreaInfo = async (opt) => {
        // 国战某一个area的某一分队的某一分支的信息
        // area的前军的右军
        let { areamark, set, index } = opt
        let info = await ctx.dao.nationwar_serverinfo.findOne({ areamark }, {
            [set]: 1
        });
        if (info && info[set]) {
            if (set == 'front' || set == 'back') {
                info = info[set][index]
            } else {
                info = info[set]
            }
        }
        return { teamlist: info }
    }

    let info = await getAreaInfo({
        areamark,
        set,
        index
    })
    console.timeEnd(__cmnwai);
    let team = [];
    // 整理信息，返回给前端
    if (info && info.teamlist) {
        let roles = info.teamlist
        let __tinfoall = timeprint_prefix + '_tall';
        console.time(__tinfoall);
        let __counter = 0;
        for (let role of roles) {
            __counter++;
            let __tinfo = [timeprint_prefix, role.uid, role.servid, __counter].join('_');
            console.time(__tinfo);
            let target = await ctx.dao.role.findOne({ servid: role.servid, uid: role.uid }, { props: 0 });
            if (!target) continue;
            let {
                rid,
                headid,
                frameid,
                rname,
                level,
            } = target.avatarInfo();
            // 查玩家阵容战斗力
            let teampower = await target.getBattlePower(`nationwar${role.teamid}`);
            team.push({ rid, headid, frameid, rname, level, teamid: role.teamid, teampower, state: role.state });
            console.timeEnd(__tinfo);
        }
        console.timeEnd(__tinfoall);
    }
    // 打印执行时间
    console.timeEnd(timeprint_prefix + '_req');
    ctx.body = {
        team
    };
}