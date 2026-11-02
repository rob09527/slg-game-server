
'use strict'
// 指挥官移动阵营
const MOVE_AREA_CACHE = {};
const MOVE_AREA_CACHE_TIME = 10000; //10s
module.exports = exports = async (ctx, next) => {
    let { set, index, posindex, areamark, toteam } = ctx.request.body;
    ctx.assert(set, 'invalid set');
    ctx.assert(index, 'invalid index');
    ctx.assert(posindex >= 0, 'invalid posindex');
    ctx.assert(areamark, 'invalid areamark');
    /**
     *  {
     *  'servid_uid':{'1':时间戳}
     * }
     */
    let moveArea = async (opt) => {
        let { set, index, posindex, areamark, toteam, servid: myservid, uid: myuid } = opt
        console.log('LEDER_MOVE_AREA', myservid, myuid, set, index, posindex, areamark, toteam, new Date().toLocaleString());
        // 如果没有toteam,则表示从预备营去前后军
        let p_index = index;
        let p_set = set;
        if (!toteam) {
            p_set = 'pre';
            p_index = null;
        } else {
            // 出了战场的玩家不能撤回。
            let checkresult = await ctx.dao.nationwar_serverinfo.checkTeam(areamark, set, index, posindex);
            ctx.assert(checkresult, 'no allowed move area');
        }
        // 去除队伍信息
        let result = await ctx.dao.nationwar_serverinfo.removeTeamByIndex(areamark, p_set, p_index, posindex);
        ctx.assert(result && result.length > 0, 'no team data');
        console.log('LEDER_MOVE_AREA_REMOVE', myservid, myuid, result, new Date().toLocaleString());

        // 获得队伍信息。
        let { servid, uid, teamid } = result[0];
        let _info;
        if (p_set == 'pre') {
            _info = await ctx.dao.nationwar_serverinfo.findOne({ areamark, servers: servid }, {
                [set]: 1
            });
        } else {
            _info = await ctx.dao.nationwar_serverinfo.findOne({ areamark, servers: servid }, {
                ['pre']: 1
            });
        }

        ctx.assert(_info, 'invalid serverinfo');
        if (toteam) {
            // 其他营地移动到预备营
            let _teamList = _info[toteam];
            _teamList.push({ servid, uid, teamid });
            await ctx.dao.nationwar_serverinfo.joinTeam(servid, uid, areamark, toteam, index, teamid, _teamList);
        } else {
            // 从预备营移动到其他营
            let _teamList = _info[set];
            let _teaminfo = _teamList[index];
            _teaminfo.push({ servid, uid, teamid });
            await ctx.dao.nationwar_serverinfo.joinTeam(servid, uid, areamark, set, index, teamid, _teamList);

        }
        console.log('LEDER_MOVE_AREA_DONE', myservid, myuid, new Date().toLocaleString());
    }

    const cacheinfo = MOVE_AREA_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] || {};
    if (!cacheinfo[`${posindex}`] || Date.now() - cacheinfo[`${posindex}`] > MOVE_AREA_CACHE_TIME) {
        //记录
        cacheinfo[`${posindex}`] = Date.now();
        MOVE_AREA_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] = cacheinfo;
        await moveArea({
            set, index, posindex, areamark, toteam,
            servid: ctx.role.servid, // 指挥官服务器id
            uid: ctx.role.uid       // 指挥官uid
        })
        // 移除cd
        delete cacheinfo[`${posindex}`];
        MOVE_AREA_CACHE[`${ctx.role.servid}_${ctx.role.uid}`] = cacheinfo;
    } else {
        ctx.assert(false, 'cd time');
    }


    ctx.body = {};
}