'use strict'

const moment = require('moment');
// 定时器
exports.name = "军团战匹配";


exports.cron = async function () {
    return global.gameconfig.legionpvp.CONFIG.MATCH;
}
const legionPvpMatch = async (servers) => {

    const now = new Date();
    console.log('START MATCH LEGION PVP', moment(now).format('YYYY-MM-DD HH:mm:ss'));
    now.setDate(now.getDate() - now.getDay() + 1); // 把时间调到星期1
    now.setHours(0, 0, 0, 0);
    const lastWeekEnd = now.getTime();
    now.setDate(now.getDate() - 7);
    const lastWeekStart = now.getTime();
    console.log("RESISTER RANGE", moment(lastWeekStart).format('YYYY-MM-DD HH:mm:ss'), "==>", moment(lastWeekEnd).format('YYYY-MM-DD HH:mm:ss'));

    const {
        MATCH_SEGMENTATION = [ // 匹配分池规则
            {
                "LIMIT_SCORE": 1050,
                "RULE": "pvpscore"
            },
            {
                "LIMIT_SCORE": 950,
                "RULE": "power"
            },
            {
                "LIMIT_SCORE": -1,
                "RULE": "pvpscore"
            }
        ], MAX_FATE = 3, FLOAT_RATE = 0.5
    } = global.gameconfig.legionpvp;
    const MAX_AVA_TIMES = global.gameconfig.legionpvp.CONFIG.MAX_AVA_TIMES; // 单周最大可匹配次数 = 单周匹配定时器执行次数
    // const MAX_FATE = 3;  // 最大缘分数，也就是不能连续操作3次匹配同一队
    // const FLOAT_RATE = 0.5; // 匹配浮动概率
    const poolOpt = {};
    if (servers) { // 按照服务器来进行分编
        poolOpt.servid = {$in: servers};
    }
    let legionsres = await global.dao.legion.find({
        ...poolOpt,
        $or: [
            {
                'pvpinfo.availableTimes': {$gt: MAX_AVA_TIMES} // 大于 MAX_AVA_TIMES 表示下周的条件也达到了，
            },
            {
                'pvpinfo.availableTimes': {$gt: 0, $lte: MAX_AVA_TIMES}, // 如果 可参与次数 0 -3, 需要检测报名时间是上周报名的
                'pvpinfo.lastRegister': {$gte: lastWeekStart, $lt: lastWeekEnd}
            }
        ]
    }, {name: 1, pvpscore: 1, power: 1, pvpinfo: 1}).sort({pvpscore: -1, power: -1});
    console.log('LEGION MATCH', servers, legionsres.length);
    if (legionsres.length === 0) {
        return;
    }
    const legions = legionsres.map(l => { // 构造成原有代码需要的结构
        return {
            pvpscore: l.pvpscore,
            power: l.power,
            legion: l._id.toString(),
            lastmatch: (l.pvpinfo && l.pvpinfo.lastmatch) || {},
        }
    });
    console.log('LEGION MATCH LEGIONS', legions.map(l => l.legion));
    const pools = []; // 按配置分池子
    let index = 0;
    for (const min of MATCH_SEGMENTATION) {
        const currentPool = [];
        currentPool.RULE = min.RULE || 'pvpscore'; // 默认积分匹配
        pools.push(currentPool);
        for (; index < legions.length; index++) {
            const lg = legions[index];
            if (lg.pvpscore > min.LIMIT_SCORE) {
                currentPool.push(lg);
                continue;
            }
            break;
        }
    }

    const pvpGroup = []; // pk 分组信息
    const NO_GROUP = []; // 未找到对手的军团

    // 对战分配
    const pvpShuffle = (disPool, sortType = 'pvpscore') => {
        const sort = typeof sortType === 'function' ? sortType : (a, b) => Math.random() < FLOAT_RATE ? -1 : b[sortType] - a[sortType];
        let halfLength = Math.round(disPool.length / 2);
        halfLength = halfLength - halfLength % 2; // 高分组保证是偶数，这样落单的才是低分组，分到下一个池子中去
        if (halfLength < 20) { // 由于池子军团数太少则不用分成两组来匹配
            halfLength = 0;
        }
        const runLength = disPool.length - halfLength;
        const heightHalf = disPool.splice(0, halfLength);
        heightHalf.sort(sort);
        disPool.sort(sort);
        const noGroup = {h: null, l: null};
        /**
         * 配对
         * @param pool {object} 池子
         * @param i {number} 分配的的下标
         * @param type {string} 分段, "h" "l"
         */
        const dispatchGroup = (pool, i, type) => {
            if (!pool[i]) {
                return;
            }
            if (!pool[i + 1]) { // 没有配对 放到单组中去
                if (noGroup[type]) { // 表示 pool[i] 已经被配对，noGroup[type]才是遗留下来未被配对的
                    NO_GROUP.push(noGroup[type]);
                } else {
                    NO_GROUP.push(pool[i]);
                }
            } else if (noGroup[type]) { // 如果上一个匹配组借用了本轮的匹配对象，则使用上一组留下的
                pvpGroup.push(noGroup[type], [pool[i + 1]]);
                noGroup[type] = null;
            } else if (pool[i].lastmatch && pool[i].lastmatch[pool[i + 1].legion] >= MAX_FATE) { // 连续匹配达到上限

                if (pool[i + 2]) { // 跳过这个寻下一个作为匹配对象
                    noGroup[type] = pool[i + 1];
                    pvpGroup.push([pool[i], pool[i + 2]]);
                } else { // 如果没有找到目标，则添加到未配对组
                    NO_GROUP.push(pool[i]);
                    NO_GROUP.push(pool[i + 1]);
                }
            } else {
                pvpGroup.push([pool[i], pool[i + 1]]);
            }
        }
        for (let i = 0; i < runLength; i += 2) { // 高分组和低分组同步进行

            dispatchGroup(heightHalf, i, 'h');
            dispatchGroup(disPool, i, 'l');
        }
    }

    for (let i = 0; i < pools.length; i++) {
        const p = pools[i];
        let matchSortType;
        if (p.RULE === 'pvpscore') { // 按积分相近匹配
            matchSortType = 'pvpscore';
        } else if (p.RULE === 'power') { // 战力匹配
            // 所有队伍按战斗力进行排一次顺序
            p.sort((a, b) => b.power - a.power);
            matchSortType = 'power';
        }
        pvpShuffle(p, matchSortType);

        if (NO_GROUP.length > 0 && pools[i + 1]) { // 如果有未匹配到的军团，将他添加到下一个池子
            pools[i + 1].push(...NO_GROUP.splice(0, NO_GROUP.length));
        }

    }

    const updateLegion = [];
    const matchData = []; // 待保存的匹配数据
    const pvpDate = moment().format('YYYY-MM-DD');
    /**
     * 构建更新数据
     * @param owner
     * @param pvpLegion
     */
    const createPvpMatchUpdate = (owner, pvpLegion) => {
        pvpLegion = pvpLegion || {legion: 'NULL'};
        const oldMatchTimes = owner.lastmatch ? (owner.lastmatch[pvpLegion.legion] || 0) : 0;
        updateLegion.push(global.dao.legion.updateOne({_id: owner.legion}, {
            $set: {
                'pvpinfo.lastmatch': {[pvpLegion.legion]: oldMatchTimes + 1}
            },
            $inc: {
                'pvpinfo.availableTimes': -1
            }
        }).catch(console.error.bind(null, 'LEGION PVP UPDATE MATCH')));
    }
    for (const pvp of pvpGroup) { // 匹配数据，更新上次匹配军团
        if (!pvp[0] || !pvp[1]) { // 增加逻辑，避免异常数据导致 匹配奔溃
            continue;
        }
        createPvpMatchUpdate(pvp[0], pvp[1]);
        createPvpMatchUpdate(pvp[1], pvp[0]);
        matchData.push({
            legion: [pvp[0].legion, pvp[1].legion],
            pvpDate
        })
        if (matchData.length > 500) { // 分段批量更新,不分段批量更新可能会导致 一次json 数据太大, 报错
            await global.dao.legionpvp.insertMany(matchData).catch(console.error.bind(null, 'LEGION PVP CREATE MATCH'))
            matchData.splice(0, matchData.length);
            await Promise.all(updateLegion);
            updateLegion.splice(0, updateLegion.length);
        }
    }
    for (let o of NO_GROUP) { // 轮空的也要更新
        createPvpMatchUpdate(o);
        matchData.push({
            legion: [o.legion, null],
            pvpDate
        })
    }
    if (matchData.length > 0) {
        await global.dao.legionpvp.insertMany(matchData).catch(console.error.bind(null, 'LEGION PVP CREATE MATCH'));
        await Promise.all(updateLegion);
    }

    console.log('LEGION PVP MATCH FINISHED', moment().format('YYYY-MM-DD HH:mm:ss'));
}

/**
 * @return {Promise<void>}
 */
exports.main = async function () {

    let servers = await global.dao.gameserver.find({start: {$lte: Date.now()}});

    servers = servers.map(serv => {
        return {
            info: { // 构造成旧的结果方便后面代码兼容
                start: serv.start,
                id: serv.servid
            },
            area: serv.area
        }
    });
    const eachGroup = {};
    servers.forEach(serv => {
        eachGroup[serv.area.id] = eachGroup[serv.area.id] || [];
        eachGroup[serv.area.id].push(serv);
    });


    // 按照 开服 30 天以上 和 未达到 30天 进行分组
    const {SERVER_LINE} = global.gameconfig.legionpvp;

    for (const areaId in eachGroup) {
        const serverPools = {OLD: [], NEW: []};
        const list = eachGroup[areaId] || [];
        if (SERVER_LINE) {
            const t = SERVER_LINE * 24 * 3600 * 1000;
            for (const s of list) {
                if (Date.now() - s.info.start > t) { // 超过的分一组
                    serverPools.OLD.push(s.info.id);
                } else {
                    serverPools.NEW.push(s.info.id);
                }
            }
            // 按服务器分组匹配
            await legionPvpMatch(serverPools.OLD).catch(console.error.bind(null, 'MATCH OLD SERVER FOR LEGION PVP'));
            await legionPvpMatch(serverPools.NEW).catch(console.error.bind(null, 'MATCH NEW SERVER FOR LEGION PVP'));
        } else {
            await legionPvpMatch(list).catch(console.error.bind(null, 'MATCH DEFAULT SERVER FOR LEGION PVP'));
        }
    }


}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
