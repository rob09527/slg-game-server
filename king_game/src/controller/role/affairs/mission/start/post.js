'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

const _chk_config = function (key, val, config) {
    return config[key] == val;
}

const COND_FN = [
    // 顺序不能改变
    _chk_config.bind(null, 'CAMP', 1),
    _chk_config.bind(null, 'CAMP', 2),
    _chk_config.bind(null, 'CAMP', 3),
    _chk_config.bind(null, 'CAMP', 4),
    _chk_config.bind(null, 'OCCU', 1),
    _chk_config.bind(null, 'OCCU', 2),
    _chk_config.bind(null, 'OCCU', 3),
    _chk_config.bind(null, 'OCCU', 4),
    _chk_config.bind(null, 'OCCU', 5),
    _chk_config.bind(null, 'OCCU', 6),
]

module.exports = exports = async (ctx, next) => {
    ctx.assert(!ctx.mission.etime, 'already start');
    if (ctx.missionKey === 'missions') { // 单人赏金任务
        const config = global.gameconfig.affairs.deepQueryOne('ID', ctx.mission.id);
        ctx.assert(config, 'invalid mission');

        let cond_flag = ctx.mission.cond.map(function () {
            return false;
        })
        let generals = [];
        let flag_star = ctx.mission.gstar == -1 ? true : false;
        for (let guid of ctx.request.body.arr) {
            const g = await ctx.dao.general.findOne({ _id: guid, rid: ctx.role.i() }, { gsid: 1, _id: 1 });
            if (!g) continue;
            const config = global.gameconfig.general[g.gsid];
            if (!config) continue;
            const missions = ctx.affairs.missions;
            const usedGuid = {};
            missions.forEach(m => {
                m.arr && m.arr.forEach(a => usedGuid[a] = 1);
            });

            ctx.assert(!usedGuid[guid], 'general used');
            if (config.STAR >= ctx.mission.gstar) flag_star = true;

            generals.push(guid);
            for (let i = 0; i < ctx.mission.cond.length; i++) {
                const id = ctx.mission.cond[i];
                const fn = COND_FN[id - 1];
                ctx.assert(fn, 'invalid condid');
                if (fn(config)) cond_flag[i] = true;
            }
        }
        cond_flag = cond_flag.every(function (f) {
            return f;
        });
        ctx.assert(cond_flag, 'cond fail');
        ctx.assert(flag_star, 'gstar err')
        ctx.assert(generals.length == ctx.mission.gnum, 'gnum err');
        ctx.mission.lock = 1;
        ctx.mission.etime = Date.now() + config.HOUR * 60 * 60 * 1000;
        ctx.mission.arr = generals;

        ctx.zhdpoint('ZJD_POINT', ctx.role, 98307); //砸金蛋-个人悬赏任务

        await ctx.role.missionInvoke('AFFAIRS_START_SOLO').save();
    } else { // 团队赏金任务
        const config = global.gameconfig.affairs_f.deepQueryOne('ID', ctx.mission.id);
        ctx.assert(config, 'invalid friend mission');
        const arrfriend = ctx.request.body.arr || [];
        ctx.assert(arrfriend.length === 2, 'whereis friends');
        const powerLimit = config.POWER; // 战斗力条件

        const _friendMap = { [arrfriend[0]]: 1, [arrfriend[1]]: 1 };
        const isUseFriends = (friends) => {
            if (!friends || friends.length === 0) {
                return false;
            }
            for (let f of friends) {
                if (_friendMap[f]) {
                    return true;
                }
            }
            return false;
        };

        if (ctx.affairs.friendsMissions && ctx.affairs.friendsMissions.length > 0) {
            for (let m of ctx.affairs.friendsMissions) { // 好友已经被使用的判断逻辑
                ctx.assert(!isUseFriends(m.friends), 'friend insquad');
            }
        }

        // 战斗力判断逻辑
        let power = ctx.role._power;
        const callbackfriend = []; // 返回的时候要返回好友更多字段
        for (const frid of arrfriend) {
            const role = await ctx.dao.role.findOne({ _id: frid }, {
                _id: 1, iconid: 1, headid: 1, frameid: 1,
                rno: 1, rname: 1, _power: 1, update: 1,
                "hide.38001": 1, friends: 1
            });
            if (!role) continue;
            callbackfriend.push({
                id: role._id.toString(),
                iconid: role.iconid,
                headid: role.headid,
                frameid: role.frameid,
                rname: role.name,
                level: role.level,
                power: role._power,
                lasttime: role.update,
            });
            if (!role.friends.includes(ctx.role.i())) continue;
            power += role._power;
        }
        ctx.assert(power >= powerLimit, 'power limit');
        ctx.mission.lock = 1;
        ctx.mission.etime = Date.now() + config.HOUR * 60 * 60 * 1000;
        ctx.mission.friends = arrfriend;
        ctx._friends = callbackfriend; // 不能存到 friends 里面会被保存进库
        await global.dao.warorder.point(ctx.role, 90568, 1, true);  // 卧龙战令-互动悬赏
        await ctx.role.missionInvoke('AFFAIRS_START_TEAM').save();
    }
    //秘境主线任务打点
    await secretTask(ctx, 99541, 1)
    ctx.body = ctx.mission;
}

