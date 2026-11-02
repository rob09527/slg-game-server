'use strict'
const moment = require('moment');
const random = require("../random");
const commonsend = require("../../util/commonsend");
const utilCursor = require("../../util/cursor");
const _ = require('lodash');


// 圣诞笔记埋点
const sdbjpoint = function (role, mark, times = 1) {
    // 活动期间才记录
    if (!isZhd('sdbj')) return;
    let items = [];
    // 需要做mark非空判断;防止role.pre里面的逻辑报错
    if (mark) items.push({ gsid: mark, count: times })
    // 日常功勋获得
    let gloryAcquire = role._change_items_[93012];
    if (gloryAcquire > 0) {
        times = gloryAcquire;
        mark = 98201;
        items.push({ gsid: mark, count: times })
    }
    let ybChange = role._change_items_[38005];
    if (ybChange < 0) { // 消耗元宝
        if (!mark || (mark && mark != 98204)) {
            // 排除98204是因为用元宝消耗的时候会走这个红点增加的接口,判断一次_change_items_[38005]的值
            // 但最后save的时候还是会走一遍这个方法。那时候的mark是空。所以_change_items_[38005]放在最后一次判断
            items.push({ gsid: 98203, count: Math.abs(ybChange) })
        }
    }
    // ??? 消耗了元宝增加招募次数 判断了两次38005的值

    if (items.length > 0) role.addItemsNoSave(items);
    sdbjRed(role);
}

// 砸金蛋埋点
const zjdpoint = function (role, mark, times = 1) {
    // 活动期间才记录
    if (!isZhd('zjd')) return;
    let [start,] = global.config.ZHD.ZJD;
    let { TASK: taskConfig } = global.gameconfig.zhd.ZJD;
    let days = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'), 'days') + 1;
    // 当日任务
    let task = taskConfig.filter((t) => t.DAY == days).map((c) => {
        return c.MARK
    });
    if (mark) {
        // 如果不是当日任务则不做处理
        if (!task.includes(mark)) return;
        role.addItemsNoSave({ gsid: mark, count: times });
    } else {
        let items = [];
        //当日活动包含消耗元宝活动才通过
        if (task.includes(98305)) {
            let ybChange = role._change_items_[38005];
            if (ybChange < 0) { // 消耗元宝
                if (!mark || (mark && mark != 98307)) {
                    // 排除98307是因为用元宝消耗的时候会走这个红点增加的接口,判断一次_change_items_[38005]的值
                    // 但最后save的时候还是会走一遍这个方法。那时候的mark是空。所以_change_items_[38005]放在最后一次判断
                    items.push({ gsid: 98305, count: Math.abs(ybChange) })
                }
            }
        }
        //当日活动包含活跃度活动才通过
        if (task.includes(98300)) {
            let hydChange = role._change_items_[93012];
            if (hydChange > 0) { // 活跃度获得
                items.push({ gsid: 98300, count: hydChange })
            }
        }
        if (items.length > 0) role.addItemsNoSave(items);
    };
    zjdRed(role);
}
//充值活动
const czphb = function (role, amount) {
    let id = "czphb"
    const zhd = global.config.ZHD[id.toUpperCase()];
    const [start, end] = zhd;
    if (ACTIVITY[id] && Date.in(start, end)) {
        role.addItemsNoSave([{ gsid: global.gameconfig[id][0][1].key, count: amount }])
        return true
    }
    return false
}

// 圣诞笔记红点
const sdbjRed = function (role) {
    // 返回可领取数量
    if (!isZhd('sdbj')) return 0;
    let { TARGET: targetConfig, TASK: taskConfig } = global.gameconfig.zhd.SDBJ;
    // 初始化
    if (!role.sdbj || (role.sdbj && Object.keys(role.sdbj).length != 3)) {
        // 初始化
        role.sdbj = role.sdbj || {};
        role.sdbj['scorerewards'] = role.sdbj['scorerewards'] || [];
        role.sdbj['progress'] = role.sdbj['progress'] || [];
        role.sdbj['nowtotal'] = role.sdbj['nowtotal'] || 0
    }

    // 当前任务进度
    let nowtotal = role.sdbj['nowtotal'] || 0;
    let task = taskConfig.map((c, index) => {
        let now = role.getProp(c.MARK);
        let status = role.sdbj['progress'][index] || 0;
        if (now >= c.NUM && status == 0) status = 1;
        return {
            status
        }
    });
    let target = targetConfig.map((t, index) => {
        let status = role.sdbj['scorerewards'][index] || 0;
        let now = t.SCORE;
        if (status < 2 && nowtotal >= now) status = 1;
        return {
            status
        }
    });
    let arr = [];
    arr.append(task, target);
    // 过滤非可领取的字段元素
    arr = arr.filter(a => a.status == 1);
    if (arr.length > 0) pushClient(role, { type: "act", content: { sdbj: arr.length } });
    return arr.length;
}
// 砸金蛋红点
const zjdRed = function (role) {
    if (!isZhd('zjd')) return 0;
    let { ZJD_LIST_INIT_COUNT, TASK: taskConfig } = global.gameconfig.zhd.ZJD;
    if ((role.zjd && Object.keys(role.zjd).length == 0) || !role.zjd) {
        // 初始化
        let jdList = Array.from({ length: ZJD_LIST_INIT_COUNT }).map((v, i) => {
            return {
                status: 0,//0 未解锁 1 解锁没有砸金蛋 2 奖励没有领取 3 奖励已经领取
                awardItems: []
            }
        })
        role.zjd = {
            progress: [],
            jdList
        }
    }
    let [start,] = global.config.ZHD.ZJD;

    let days = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'), 'days') + 1;
    // 当前任务进度
    let task = taskConfig.filter((t) => t.DAY == days).map((c, index) => {
        let now = role.getProp(c.MARK);
        let status = role.zjd['progress'][index] || 0;
        if (now >= c.NUM && status == 0) status = 1;
        return {
            status
        }
    });
    //金蛋进度
    try {
        let zjdCount = role.zjd.jdList.map((t, index) => {
            let status = role.zjd['jdList'][index].status || 0;
            status = status == 2 ? 1 : 0;
            return {
                status
            }
        });
        let arr = [];
        arr.append(task, zjdCount);
        // 过滤非可领取的字段元素
        arr = arr.filter(a => a.status == 1);
        if (arr.length >= 0) pushClient(role, { type: "act", content: { zjd: arr.length } });
        return arr.length;
    } catch (error) {
        console.log("error", error)
    }

}
//新春招财聚宝
const xczcRed = function (role) {
    if (!isZhd('xczc')) return 0;
    let freeCount = 0;
    if ((role.xczc && Object.keys(role.xczc).length == 0) || !role.xczc) {
        freeCount = 1;
    } else {
        freeCount = role.xczc.freeCount;
    };
    if (freeCount >= 0) pushClient(role, { type: "act", content: { xczc: freeCount } });
    return freeCount;
}

//元宵灯会红点
const yxdhRed = function (role) {
    if (!isZhd('yxdh')) return 0;
    let labterns = 0;
    if ((role.yxdh && Object.keys(role.yxdh).length == 0) || !role.yxdh) {
        labterns = 5;
    } else {
        role.yxdh.forEach(labtern => {
            if (!labtern) labterns++;
        });
    };
    if (labterns >= 0) pushClient(role, { type: "act", content: { yxdh: labterns } });
    return labterns;
}
//迎春筹办
const yccbRed = function (role) {
    if (!isZhd('yccb')) return 0;
    if ((role.yccb && Object.keys(role.yccb).length == 0) || !role.yccb) {
        return 0;
    };
    let { taskProcess } = role.yccb;
    let arr = taskProcess.filter(f => f == 1);
    if (arr.length >= 0) pushClient(role, { type: "act", content: { yccb: arr.length } });
    return arr.length;
}
// 周主题基金
const zztjjRed = function (type, role) {
    const key = role.isXS(`xs_zztjj_${type}`) ? `xs_zztjj_${type}` : `zztjj_${type}`;
    if (!isZhd.call(role, key)) return;
    let key1 = role.isXS(`xs_zztjj_${type}`) ? `zztjj_${type}` : `zztjj1_${type}`
    if (type == 'dj' || type == 'gz') key1 = `zztjj_${type}`;
    let record = role[key1] || { ispay: 0, num: 0 };
    if (!record.ispay) return;
    let zhd = global.ACTIVITY[key].getInterval(role);
    let [start, end] = [zhd.start, zhd.etime];
    // 计算剩余次数
    let time = moment(moment().format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'), 'days');
    let num = time + 1 - (record.num || 0)
    return num > 0 ? num : 0;
}
const zmflIsTime = function (now, week) {
    // 时间 0-未到时间  1-已到时间  2-已过期
    // 明后两天都不等于传入的星期数，则过期
    let tow = moment(now.valueOf()).add(1, 'days').isoWeekday() == week || moment(now.valueOf()).add(2, 'days').isoWeekday() == week;
    return now.isoWeekday() == week ? 1 : (tow ? 0 : 2);
}
const zztjjpoint = function (type, role) {
    let content = zztjjRed(type, role);
    if (content) pushClient(role, { type: "act", content: { [`zztjj_${type}`]: content } });
}
// 是否在周活动内
// 兼容后台没配活动的情况
const isZhd = function (key) {
    let lp = key.toLowerCase();
    if (!this || !this.create) { // this 未指向 role
        const zhd = global.config.ZHD[key.toUpperCase()];
        const [start, end] = zhd;
        return Date.in(start, end);
    }
    return global.ACTIVITY[lp] && global.ACTIVITY[lp].isactive(this);
}

const commomRed = function (role, key, callback = _ => true) {
    const _key = role.isXS() ? `ws_${key}` : key;
    if (isZhd.call(role, _key)) {
        let record = role[key] || [];
        let config = global.gameconfig.zhd_newhero[_key.toUpperCase()] || global.gameconfig.zhd[_key.toUpperCase()];
        if (!config) {
            throw new Error('MISS ZHD CONFIG:' + _key);
        }
        return config.filter((items, index) => {
            let bought = record[index] || 0;
            return items.LIMIT - bought > 0 && callback(items);
        }).length;
    }
    return 0;
}

const ldcfReward = function (role, checkTime = true) {
    if (checkTime && !isZhd.call(role, "ldcf")) return 0;
    const { LDCF: { PMARK, MARK, LIMIT } } = global.gameconfig.zhd;
    const count = role.getProp(PMARK);
    const markCount = role.getProp(MARK);
    return Math.min(markCount, LIMIT - count);
}

const jfbxRed = function (role) {
    let key = role.isXS('xs_jfbx') ? 'xs_jfbx' : 'jfbx';
    if (isZhd.call(role, key)) {
        let record = role['jfbx'] || [];
        if (role.isXS('xs_jfbx')) key = role.isXSConKey(key);
        let { EVENT: event = [], BOX = [] } = global.gameconfig.zhd[key.toUpperCase()] || {};
        let totalScore = event.map(({ MARK }) => role.getProp(MARK)).reduce((sum, cur) => sum + cur, 0);
        return BOX.filter((items, index) => {
            let bought = record[index] || 0;
            return bought == 0 && totalScore >= items.SCORE;
        }).length;
    }
    return 0;
}

const yhshRed = function (role, mode) {
    if (!isZhd.call(role, mode)) return 0;
    const { TASK } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    return TASK
        .filter(({ FINISH, RMARK }) =>
            !RMARK.every(({ GSID, COUNT }) => role.getProp(GSID) >= COUNT) &&
            FINISH.every(({ GSID, COUNT }) => role.getProp(GSID) >= COUNT))
        .length;
}

const yhzhRed = function (role, act) {
    let modes = ["yhzh", "yhzh1"];
    for (let mode of modes) {
        if (!isZhd.call(role, mode)) continue;
        const { FREEMARK, COST } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
        const castMark = COST[0].ITEM.GSID;
        act[mode] = role.getProp(castMark) > 0 || role.getProp(FREEMARK) == 0 ? 1 : 0;
    }
}


const jthlRed = function (role, mode) {
    if (mode == "zhd" && !isZhd.call(role, "jthl")) return 0;
    const config = mode == "zhd" ? global.gameconfig.zhd.JTHL : global.gameconfig.jthl;
    const { MARK, REWARDS } = config;
    let totalDays = role.getProp(MARK);
    let record = role.jthl || [];
    return REWARDS.filter(({ DAYS, RMARK }, index) => {
        let status = (mode == "zhd" ? role.getProp(RMARK) : (record[index] || 0)) > 0 ? 2 : (totalDays >= DAYS ? 1 : 0);
        return status == 1;
    }).length;
}

const tnqwRed = async function (role, tag) {
    let upTag = tag.toUpperCase();
    if (!isZhd.call(role, tag)) return 0;
    // 活动总积分(tnqw没有积分)
    let curNum = undefined;
    if (tag == "sslx") {
        curNum = global.gameconfig.zhd[upTag].SCORE
            .map(({ MARK }) => role.getProp(MARK))
            .reduce((sum, cur) => sum + cur, 0);
    }
    let boss = global.gameconfig.zhd[upTag].BOSS.LIST;
    let dot = 0;
    let all = [];
    for (let i = boss.length - 2; i >= 0; i--) {
        let one = await global.dao.tnqwboss.findOne({ rid: role.i(), index: i, tag });
        // boss 已激活但未击杀
        if ((curNum == undefined ? true : curNum >= boss[i].NUM) && (!one || !one.kill)) {
            dot += 1;
        }
        if (one && one.kill) all.push(true);
    }
    // 最终boss是否激活
    let finalBoss = await global.dao.tnqwboss.findOne({ rid: role.i(), index: boss.length - 1, tag });
    return dot + (all.length == boss.length - 1 && (!finalBoss || !finalBoss.kill) ? 1 : 0);
}

const hyhlRed = function (role, mode) {
    if (!isZhd.call(role, mode)) return 0;
    let record = role[mode] || [];
    let { MARK, ITEM } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    let total = role.getProp(MARK);
    return ITEM.filter(({ SCORE }, index) => {
        let status = record[index] == 1 ? 2 : (total >= SCORE ? 1 : 0);
        return status == 1;
    }).length;
}

// 活跃豪礼跟踪标记埋点
const hyhlPushRed = function (role) {
    const modes = ["hyhl", "hyhl1"]
    for (let mode of modes) {
        if (!isZhd.call(role, mode)) continue;
        let { MARK, FOLLOWMARK } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
        if (!Object.keys(role._change_items_).includes(FOLLOWMARK.toString())) continue;
        let count = role._change_items_[FOLLOWMARK];
        if (count <= 0) continue;
        role.addItemsNoSave({ GSID: MARK, COUNT: count });
        // 红点通知
        let dot = hyhlRed(role, mode);
        if (dot) pushClient(role, { type: 'act', content: { [mode]: dot } });
    }
}

const ljczRed = function (role, ljcz) {
    if (!isZhd.call(role, ljcz)) return 0;
    const { MARK, ITEMS } = global.gameconfig.zhd_newhero[ljcz.toUpperCase()] || global.gameconfig.zhd[ljcz.toUpperCase()];
    let total = role.getProp(MARK);
    const record = role[ljcz] || [];
    return ITEMS.filter((each, index) => {
        // 1 => 已达成未领取 2 => 已领取 0 => 未达成
        let status = record[index] == 1 ? 2 : (total >= each.NUM ? 1 : 0)
        return status == 1;
    }).length;
}

const lxljczRed = function (role, lxljcz) {
    if (!isZhd.call(role, lxljcz)) return 0;
    const { FULL, ITEMS } = global.gameconfig.zhd_newhero[lxljcz.toUpperCase()] || global.gameconfig.zhd[lxljcz.toUpperCase()];
    const record = role[lxljcz] || { task: [] };
    let cur = 0;
    let len = ITEMS.filter((each, index) => {
        // 1 => 已达成未领取 2 => 已领取 0 => 未达成
        let info = record.task[index];
        if (!info) { return false; }
        if (info.num >= each.NUM) {
            cur++;
            return !info.got;
        }
        return false;
    }).length;
    //23/3/13 策划去掉
    // if (cur == ITEMS.length && record.all && !record.all.got) {
    //     len++;
    // }
    return len;
}

const smzmxsRed = function (role, smzmxs) {
    let obj = { smfl: 0, smzm: 0, smlb: 0 };
    if (!isZhd.call(role, smzmxs)) { return obj };
    const config = global.gameconfig.zhd_newhero[smzmxs.toUpperCase()] || global.gameconfig.zhd[smzmxs.toUpperCase()];
    if (!config) { return obj };
    let smzm = role[smzmxs];
    if (!smzm) { return { smfl: 1, smzm: 1, smlb: 1 } };
    let now = Date.now();

    let COST = config.COST;
    if (smzm.freetime == 0) {
        obj.smzm = 1;
    }
    else {
        for (let times in COST) {
            if (!COST[times].FREE_CD) { continue; }
            if (Math.abs(now - smzm.freetime) >= COST[times].FREE_CD * 3600 * 1000) {
                obj.smzm = 1;
                break;
            };
        }
    }

    let idx = config.SMLB.findIndex((value, index) => {
        return value.REFRESHTYPE == 'day' && value.PRICE == 0 && !smzm.smlbrecord[index];
    })
    if (idx > -1) {
        obj.smlb = 1;
    }

    idx = config.SMFL.findIndex((value, index) => {
        return smzm.val >= value.NUM && !smzm.smflrecord[index];
    })
    if (idx > -1) {
        obj.smfl = 1;
    }
    return obj;
}

const hglbRed = function (role, key) {
    if (!isZhd.call(role, key)) return 0;
    const record = role[key];
    if (!record) {
        return 0;
    }
    const { PROCESS, MARK } = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
    let cur = role.getProp(MARK);

    let len = PROCESS.filter((value) => {
        return cur >= value.SCORE && role.getProp(value.PMARK) == 0;
    }).length;
    return len;
}

const ljczPoint = function (role, price, ljcz) {
    ljcz = role.isXS(`xs_${ljcz}`) ? `xs_${ljcz}` : ljcz;
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    //如果新手不可见，并且是新手，那么新手充值则不累计
    if (!SPECIAL_XS[ljcz.toUpperCase()] && role.isXS()) return;
    if (isZhd.call(role, ljcz)) {
        let key = role.isXS(`xs_${ljcz}`) ? role.isXSConKey(`xs_${ljcz}`) : ljcz;

        const { MARK: zhdChargeMark } = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
        // 累计充值长连接红点推送
        role.addItemsNoSave({ GSID: zhdChargeMark, COUNT: price });
        let dot = ljczRed(role, ljcz);
        if (ljcz.startsWith('xs_')) ljcz = ljcz.replace('xs_', '');
        if (dot) pushClient(role, { type: 'act', content: { [ljcz]: dot } });
    }
}

const lxljczPoint = function (role, price, lxljcz) {
    lxljcz = role.isXS(`xs_${lxljcz}`) ? `xs_${lxljcz}` : lxljcz;
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    //如果新手不可见，并且是新手，那么新手充值则不累计
    if (!SPECIAL_XS[lxljcz.toUpperCase()] && role.isXS()) return;
    if (isZhd.call(role, lxljcz)) {
        let key = role.isXS(`xs_${lxljcz}`) ? role.isXSConKey(`xs_${lxljcz}`) : lxljcz;
        let record = role[key] || { task: [], all: { got: 0 } };

        const { ITEMS } = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
        if (role[key].task.length != ITEMS.length) {
            let task = [];
            for (let i = 0; i < ITEMS.length; i++) {
                let info = role[key].task[i] || { num: 0, got: 0, time: 0 };
                task.push(info);
            }
            role[key].task = task;
            role.markModified(`${key}`);
        }
        let now = new Date().setHours(0, 0, 0, 0);
        let today = record.task.find(value => value.time == now);
        let info;
        if (!today) {
            for (let i = 0; i < ITEMS.length; i++) {
                info = record.task[i];
                if (info.num < ITEMS[i].NUM) {
                    info.time = now;
                    info.num = 0;
                    info.got = 0;
                    today = info;
                    break;
                }
            }
        }
        if (today) {
            today.num += price;
            role[key] = record;
            role.markModified(`${key}`);
        }
        // 累计充值长连接红点推送
        let dot = lxljczRed(role, lxljcz);
        if (lxljcz.startsWith('xs_')) lxljcz = lxljcz.replace('xs_', '');
        if (dot) pushClient(role, { type: 'act', content: { [lxljcz]: dot } });
    }
}

const hglbPoint = function (role, key) {
    let dot = hglbRed(role, key);
    if (dot) pushClient(role, { type: 'act', content: { ["hglb"]: dot } });
}

// 欢聚一堂宝箱红点
const hjytBoxRed = function (role) {
    const { BOXLIST, RCOUNT } = global.gameconfig.zhd.HJYT;
    let hjyt = role.hjyt || {};
    let boxRecord = hjyt.box || [];
    const circle = Math.floor((hjyt.spot || 0) / RCOUNT);
    return BOXLIST
        .filter(({ NUM }, index) => (boxRecord[index] ? 2 : (circle >= NUM ? 1 : 0)) === 1)
        .length;
}

// 监听活动道具变化，用于红点长连接推送
const markChangeFn = function (role) {
    for (let key of CHANGE_MARK_ACT) {
        if (!isZhd.call(role, key)) continue;
        const { MARK } = global.gameconfig.zhd[key.toUpperCase()];
        // 消耗道具不推送红点
        if (!role._change_items_[MARK] || role._change_items_[MARK] < 0) continue;
        if (role.getProp(MARK) > 0) pushClient(role, { type: 'act', content: { [key]: 1 } });
    }
}
const hhyyConfig = function () {
    return "HHYY";
}

// 画好月圆本期的任务
const hhyyCurTasks = function () {
    const { ITEMS } = global.gameconfig.zhd[hhyyConfig()];
    let index = -1;
    const [, actend] = global.config.ZHD.HHYY;
    const now = Date.now();
    for (let i = 0; i < ITEMS.length; i++) {
        const { REFRESH } = ITEMS[i];
        let { REFRESH: nextRef = actend } = ITEMS[i + 1] || {}; // 下一期
        if (now >= moment(REFRESH).valueOf() && now < moment(nextRef).valueOf()) {
            index = i;
            break;
        }
    }
    return index;
}
// 卧龙战令红点
const warorderRed = function (role, warorder) {
    if (!warorder) return 0
    const { TASKS: tasks, WDMARK } = global.gameconfig.warorder;
    const { buytime = 0 } = warorder.charge || { buytime: 0 };
    const { get } = warorder.levelbuy || { get: 1000 };
    let currentLevel = Math.trunc(role.getProp(WDMARK) / get) + 1;
    // 每日任务
    let dot = tasks.filter(({ MARK, NUM }) => role.getProp(MARK) == NUM).length;
    // 群雄战令
    let warArrs = warorder.wdlevel.map(({ nget = 0, hget = 0, level, ...o }) => {
        if (currentLevel >= level && nget != 2) {
            nget = 1;
        }
        if (buytime > 0 && currentLevel >= level && hget != 2) {
            hget = 1;
        }
        return { nget, hget, level, ...o };
    });
    let count = 0;
    warArrs.forEach(war => {
        if (war.nget == 1 || war.hget == 1) count++;
    });

    return dot + count;
}

// 每日累冲
const daychargeRed = function (role) {
    const config = global.gameconfig.daycharge;
    if (!config) return 0;
    const record = role.daycharge || [];
    return config.ITEM.filter(({ MONEY }, index) => !record[index] && role.getProp(90221) >= MONEY).length;
}

// 许愿树
const xyshRed = function (role, act) {
    if (!isZhd.call(role, "xysh")) return;
    const { num = 0, wishIndex = -1, wishDone = false } = role.xysh || {};
    if (wishIndex < 0) { // 未选择愿望
        act.xysh = 1;
        return;
    }
    const { MARK, TOTAL } = global.gameconfig.zhd.XYSH || {};
    if (num < TOTAL) {
        // 选择愿望后活动道具大于0
        if (role.getProp(MARK) > 0) act.xysh = 1;
    }
    else if (!wishDone) { // 培养进度达成且未领取
        act.xysh = 1;
    }
}

// 刷新红包
const hydtRefPack = async function (role, start, initNum, now) {
    const { PACK, LIMIT, NUM } = global.gameconfig.zhd.HYDT;
    let record = role.hydt || [];
    const validNum = record.filter(({ reward, end }) => end > now && !reward);
    let exc = validNum.map(({ id }) => id); // 防止出现在同一个位置
    let init = initNum || Math.min(LIMIT - validNum.length, NUM);
    if (init <= 0) return;
    let pkgs = JSON.parse(JSON.stringify(PACK));
    pkgs = pkgs.filter(({ ID }) => !exc.includes(ID)); // // 去除之前获得的位置
    // 红包出现的位置需要解锁
    pkgs = pkgs.filter(({ ID }) => {
        const luckConfig = global.gameconfig.function_luck[ID];
        if (!luckConfig) return true;
        return role.getProp(luckConfig.REQUIRE_NAME) >= luckConfig.REQUIRE_COUNT;
    })
    if (pkgs.length <= 0) return;
    for (let i = 0; i < init; i++) {
        // 可出现的红包位置为空则跳出循环
        if (pkgs.length <= 0) break;

        const rates = pkgs.deepMap("WEIGH");
        const index = random.inweight(rates);
        const pack = pkgs[index];
        if (!pack) continue;
        if (exc.includes(pack.ID)) {
            i--;
            continue;
        }
        record.push({ id: pack.ID, end: start + pack.LIFE * 3600000 });
        exc.push(pack.ID);
        pkgs.splice(index, 1); // 去除刚刚获得的位置
    }
    record = record.filter(({ end }) => end > now); // 清除过期红包
    if (record.length == 0) return; // 兼容因活动开始时间过早导致初始红包过期的情况
    await role.updateOne({ $set: { hydt: record } });
}

// 新春任务红点检查方法
const xcrwRed = function (role) {
    if (!isZhd.call(role, "xcrw")) return null;
    let dot = 0;
    for (let { REWARD, PROCESS } of global.gameconfig.zhd.XCRW.TASKS) {
        if (role.getProp(REWARD) > 0) continue;
        let flag = PROCESS.every(function ({ GSID, COUNT }) {
            return role.getProp(GSID) >= COUNT
        })
        if (!flag) continue;
        dot++;
    }
    return dot > 0 ? { xcrw: dot } : null;
}

// 进度标记和领取标记为同一个标记的情况
const taskPoint = function (role, mark, num, count = 1) {
    const markCount = role.getProp(mark);
    const diff = Math.min(count, num - markCount);
    if (diff <= 0) return;
    role.addItemsNoSave({ GSID: mark, COUNT: diff });
}

const dbrwRed = function (role, act, mode) {
    if (!isZhd.call(role, mode) || !global.gameconfig.zhd[mode.toUpperCase()]) return;
    const tasks = global.gameconfig.zhd[mode.toUpperCase()].TASKS;
    let dot = tasks.filter(({ MARK, NUM }) => {
        const countinfo = role.getProp(MARK);
        const count = countinfo & 0x0000ffff; //  取出低位数据作为进度
        const receiveinfo = (countinfo & 0xffff0000) >> 16; // 取出高位保存的领取记录
        return receiveinfo == 0 && count >= NUM;
    }).length;
    if (dot > 0) act[mode] = dot;
}

const dbrwPushRed = function (role, mode) {
    if (isZhd.call(role, mode) && global.gameconfig.zhd[mode.toUpperCase()]) {
        const tasks = global.gameconfig.zhd[mode.toUpperCase()].TASKS;
        if ([...tasks, { MARK: 93012 }, { MARK: 38005 }].some(({ MARK }) => role._change_items_[MARK])) {
            let dot = tasks.filter(({ MARK, NUM }) => role.getProp(MARK) == NUM).length;
            pushClient(role, { type: "act", content: { [mode]: dot } });
        }
    }
}

// 特惠基金红点
const thjjRed = function (role, key, act) {
    if (!isZhd.call(role, key)) return;
    const config = global.gameconfig.zhd[key.toUpperCase()];
    if (!config) return;
    let { COND, ITEMS } = config;
    if (COND.some(co => {
        let [spe, type] = co.split(".");
        return role[spe][type] <= 0;
    })) return;
    let record = role[key] || {};
    if ((record.isbuy || 0) == 0) return;
    record.num = record.num || 0;
    let dot = 0;
    let [start] = global.config.ZHD[key.toUpperCase()];
    let day = moment().diff(moment(start), "day") + 1;
    day = Math.min(day, ITEMS.length);
    for (let i = 0; i < day; i++) {
        if (i < record.num) continue;
        dot++;
    }
    if (dot > 0) act[key] = dot;
}

// 武圣挑战红点
// 有剩余挑战次数、有奖励可领取
const wstzRed = async function (role) {
    if (!isZhd.call(role, "wstz")) return 0
    const { BOSSES } = global.gameconfig.zhd.WSTZ
    let dot = 0
    for (const { BOSSID: bossid, CLIMIT, DAYREWARD } of BOSSES) {
        let wstzboss = await global.dao.wstz.findOne({ rid: role.i(), bossid }, { dailycount: 1, dailydamage: 1, dailyrecord: 1 })
        wstzboss = wstzboss || { dailycount: 0, dailyrecord: [], dailydamage: 0 }
        dot += CLIMIT - wstzboss.dailycount
        DAYREWARD.forEach(({ DAMAGE }, index) => {
            if (!wstzboss.dailyrecord[index] && wstzboss.dailydamage >= DAMAGE) dot++
        })
    }
    return dot
}

const zcjbRed = async function (role) {
    if (!isZhd.call(role, "zcjb")) return;
    let record = role.zcjb || { dayfree: 0 }
    const {
        FREELIMIT,
        BOX,
    } = global.gameconfig.zhd.ZCJB
    let dot = FREELIMIT - record.dayfree;
    record.box = record.box || [];
    record.dayhit = record.dayhit || 0;
    for (let [i, { NUM }] of Object.entries(BOX)) {
        if (record.box[i]) continue;
        if (record.dayhit < NUM) break;
        dot++;
    }
    return dot;
}
// 许愿筑梦红点
const xyzmRed = async function (role) {
    let key = role.isXS('xs_xyzm') ? 'xs_xyzm' : 'xyzm';
    if (!isZhd.call(role, key)) return 0;
    if (!role.xyzm || !role.xyzm.recruit) return 0;
    let total_wish = 0;
    for (let [_, wish] of Object.entries(role.xyzm.recruit)) {
        total_wish += (wish || 0);
    }
    let rolltimes = role.xyzm.rolltimes || 0;
    if (role.isXS('xs_xyzm')) key = role.isXSConKey(key);
    let {
        WISH,
    } = global.gameconfig.zhd[key.toUpperCase()] || {};
    let num = 0;
    for (let i = rolltimes; i < WISH.length; i++) {
        if (total_wish < WISH[i]) break;
        num++;
    }
    return num;
}
/**
 * 时光占卜
 */
const sgzbRed = async function (role) {
    if (!isZhd('sgzb')) return;
    let sgzb = role.sgzb || { free: 0 }
    return global.gameconfig.zhd.SGZB.FREECHANCE > sgzb.free ? 1 : 0;
}
const CHANGE_MARK_ACT = [
    "xylp", "hjyt",
    "gjdl", "hqsd",
]

/**
 * 珍宝基金
 */
async function ZHENBAO_FUND(role) {
    let dot = 0;
    for (let i = 0; i < global.gameconfig.zhenbao_fund_reward.length; i++) {
        // 未激活 未购买
        if (i == 0 && (!role.zhenbao_fund_start || !role.zhenbao_fund_buytime)) continue;
        if (i == 1 && (!role.zhenbao_fund_start1 || !role.zhenbao_fund_buytime1)) continue;
        const {
            DAILY_REWARD,
        } = global.gameconfig.zhenbao_fund_reward[i];
        const start = role.getProp(i == 0 ? 98425 : 98427);
        let days = new Date(i == 0 ? role.zhenbao_fund_start : role.zhenbao_fund_start1)
            .dayFromNow();
        days = Math.min(days, DAILY_REWARD.length);
        dot = days - start;
        const finish_token = role.getProp(i == 0 ? 98426 : 98428);
        // 终极大奖提示
        if (days >= DAILY_REWARD.length && dot < 1 && !finish_token) dot = 1;
        if (dot) return dot
    }

    return dot;
}

const LJDL_MODE = ["ljdl", "ljdl1", "dlhl", "dlhl1"];

const tasks = {
    "GUANYU_RECHARGE_HOOK": async function (role) {
        // 百级关羽
        let guanyuRecord = await global.dao.guanyu.findOne({ rid: role._id });
        if (!guanyuRecord) {
            let $in = global.dao.guanyu.gsidList();
            let cond = {
                rid: role.i(),
                gsid: { $in },
            }
            let maxLv = 0;
            // 尝试获取最高等级&星级的关羽
            let guanyuInfo = await global.dao.general.find(cond, { level: 1 }).hint({ rid: 1 }).sort({ level: -1 }).limit(1);
            if (guanyuInfo && guanyuInfo.length > 0) {
                maxLv = guanyuInfo[0].level;
            }
            let { DAYS } = global.gameconfig.guanyu;
            await global.dao.guanyu.create({ rid: role._id, level: maxLv, expireAt: moment().add(+DAYS, 'd').valueOf() });
        }
        tasks['GUANYU_PUSH'](role, await tasks['GUANYU_REWARD'](role));
    },
    /**
     * 返回可领取奖励数量
     * @param {mongoose.Role} role
     */
    "GUANYU_REWARD": async function (role) {
        let data = await global.dao.guanyu.rewardstatus(role._id, role.get('special.gz'), role.get('special.zz'));
        if (!data) return 0;
        return data.reduce(function (cur, nxt) {
            if (nxt.status === 1) cur++;
            return cur;
        }, 0)
    },
    /**
     * 检查奖励推送
     * @param {mongoose.Role} role
     */
    "GENERA_LVUP": async function (role, gsid, newlevel = 0, oldlevel = 0) {
        let wujian = ['guanyu', 'zhaoyun'];
        let idx = global.dao.guanyu.gsidInList(gsid, wujian);
        if (idx < 0) return;
        if (idx == 0) { // 过滤只处理关羽
            // 更新最高等级
            let cond = {
                rid: role._id,
                level: {
                    $lt: +newlevel,
                },
            }
            let $set = {
                level: +newlevel,
            }
            await global.dao.guanyu.updateOne(cond, { $set });
            let num = await tasks['GUANYU_REWARD'](role);
            tasks['GUANYU_PUSH'](role, num);
        }
        if (idx == 1) { // 过滤只处理赵云

        }
        // 指定武将升级
        let key = wujian[idx].toUpperCase();
        for (let i = oldlevel + 1; i <= newlevel; i++) {
            role[`${key}_LV_${i}`] = i
        }
    },
    /**
     * 根据可领奖励数推送百级关羽红点
     * @param {mongoose.Role} role
     * @param {int} num
     * @returns
     */
    "GUANYU_PUSH": function (role, num = 0) {
        if (num < 1) return;
        global.pushClient(role, { type: 'act', content: { guanyu: num } });
    },
    /**
     * 根据武将等级推送武将升星活动
     * @param {*} role
     * @param {*} level
     */
    "GENERAL_STAR": async function (role, level, name = 'guanyu') {
        // 过滤只处理指定武将(目前是关羽)
        if (global.dao.general.getGsidsByParam({ NAME: name }).length < 1) return;

        const { COND, DAYS } = global.gameconfig.generalstar;
        // 是否满足条件
        if (level < (+COND || 100)) return;

        let record = await global.dao.generalstar.findOne({ rid: role.i(), gname: name });
        // 存在即不推送也不创建
        if (!!record) return;

        await global.dao.generalstar.create({ rid: role.i(), gname: name, expire: moment().add(+DAYS, 'd').valueOf() });

        role.pushList = role.pushList || [];
        role.pushList.push({ type: 'act', content: { generalstar: 1 } });
    },
    // 秘境宝阁红点
    "MJBGRED": function (role) {
        if (!isZhd.call(role, "mjbg")) return 0;
        const { MARK } = global.gameconfig.zhd_mjbg;
        // 有活动道具
        if (role.getProp(MARK) > 0) {
            return 1;
        }
        return 0;
    },
    "HJYTBOXRED": hjytBoxRed,
    /**
     * 活动道具大于0则显示红点
     * @param {object} role
     * @param {object} act /role/remind/post.js 中的 act
     */
    "MARKRED": async function (role, act, warorder) {
        for (let key of CHANGE_MARK_ACT) {
            if (!isZhd.call(role, key)) {
                act[key] = 0;
                continue;
            };
            const { MARK } = global.gameconfig.zhd[key.toUpperCase()];
            act[key] = role.getProp(MARK) > 0 ? 1 : 0;
            if (act[key] == 1) continue;
            // 需要额外处理的活动红点
            if (key == "hjyt" && hjytBoxRed(role) > 0) {
                act[key] = 1;
                continue;
            }
        }
        // 可许愿时显示红点
        if (isZhd.call(role, "hhyy")) {
            const curperoid = hhyyCurTasks();
            if (curperoid >= 0) {
                const { ITEMS } = global.gameconfig.zhd[hhyyConfig()];
                const { START, END } = ITEMS[curperoid];
                if (Date.in(Date.parse(START), Date.parse(END))) {
                    let fmoon = await commonsend("/activityinfo/fmoon/moon/peroid", {
                        peroid: curperoid,
                        servid: role.servid,
                        rid: role.i(),
                    });
                    if (fmoon.length == 0) act.hhyy = 1;
                }
            }
        }
        // 每日累冲
        act.daycharge = daychargeRed(role)
        // 卧龙战令
        act.warorder = warorderRed(role, warorder);
        // 累计充值
        act["ljcz"] = ljczRed(role, "ljcz") || ljczRed(role, "xs_ljcz");
        act["ljcz1"] = ljczRed(role, "ljcz1") || ljczRed(role, "xs_ljcz1");
        act["ljcz2"] = ljczRed(role, "ljcz2") || ljczRed(role, "xs_ljcz2");
        act["ljcz3"] = ljczRed(role, "ljcz3") || ljczRed(role, "xs_ljcz3");
        act["ljcz4"] = ljczRed(role, "ljcz4") || ljczRed(role, "xs_ljcz4");
        act["lxljcz"] = lxljczRed(role, "lxljcz") || lxljczRed(role, "xs_lxljcz");
        act["lxljcz1"] = lxljczRed(role, "lxljcz1") || lxljczRed(role, "xs_lxljcz1");
        act["lxljcz2"] = lxljczRed(role, "lxljcz2") || lxljczRed(role, "xs_lxljcz2");
        act["lxljcz3"] = lxljczRed(role, "lxljcz3") || lxljczRed(role, "xs_lxljcz3");
        act["smzmxs1"] = smzmxsRed(role, "smzmxs1");
        let hglb1 = hglbRed(role, 'hglb1');
        let hglb2 = hglbRed(role, 'hglb2');
        let hglb3 = hglbRed(role, 'hglb3');
        let hglb4 = hglbRed(role, 'hglb4');
        act["hglb"] = hglb1 || hglb2 || hglb3 || hglb4;
        // 许愿树
        xyshRed(role, act);
        dbrwRed(role, act, "dbrw");
        dbrwRed(role, act, "mjsl");
        thjjRed(role, "thjj", act);
        thjjRed(role, "thjj1", act);
        act.wstz = await wstzRed(role)

        yhzhRed(role, act)
        // 招财进宝红点
        act.zcjb = await zcjbRed(role, act);

        // 许愿筑梦
        act.xyzm = await xyzmRed(role);
        // 在GM后台配的活动通用红点
        const GM_EVENT = [
            "qxsy", // 七星闪耀
            "xs_qxsy",//新手七星山腰
            "zslb", // 战神吕布
            "ny_shop", // 新春商店
            "ny_signin", // 新春签到
            "yx_shop", // 元宵商店
            "yx_signin", // 元宵豪礼
            "yx_uproar", // 大闹元宵
        ];
        for (let event of GM_EVENT) {
            const tmp = global.ACTIVITY[event];
            if (tmp && event.startsWith('xs_')) {
                if (!tmp.isactive(role)) continue;
                event = event.replace('xs_', ''); // 标记去掉 xs_前缀，保证前端逻辑复用
            }
            act[event] = tmp ? tmp.reddot(role) : 0;
        }
    },
    "HHYYCOMMONDATE": function () {
        return hhyyCurTasks();
    },
    "HHYYCFG": function () {
        return hhyyConfig();
    },
    "CZPHB": function (role, account) {
        return czphb(role, account)
    },
    // 英魂守护
    'YHSH': function (role, gsidset, mark) {
        const modes = ["yhsh", "yhsh1"]
        for (let mode of modes) {
            if (!isZhd.call(role, mode)) continue;
            const { GENERAL } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
            let is_onset = false;
            // 暂没找到lodash方法
            for (let gsid of GENERAL) {
                if (gsidset.has(gsid)) {
                    is_onset = true;
                    break;
                }
            }
            if (!is_onset) return;
            role.addItemsNoSave(mark);
        }
    },
    // 英魂守护红点
    "YHSHRED": function (role, mode = "yhsh") {
        return yhshRed(role, mode);
    },
    // 监听标记变化，红点推送
    "MARKSPUSH": async function (role) {
        // 英魂守护
        let modes = ["yhsh", "yhsh1"];
        for (let mode of modes) {
            if (!isZhd.call(role, mode)) continue;
            const { TASK } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
            const marks = TASK.map(({ FINISH }) => FINISH)
                .reduce((pre, next) => pre.concat(next))
                .map(x => x.GSID);
            if (marks.some(mark => role._change_items_[mark]) && yhshRed(role, mode) > 0) {
                pushClient(role, { type: 'act', content: { [mode]: 1 } });
            }
        }
        // 英魂召唤
        modes = ["yhzh", "yhzh1"];
        for (let mode of modes) {
            if (!isZhd.call(role, mode)) continue;
            const { COST, FREEMARK } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
            const castMark = COST[0].ITEM.GSID;
            if (
                role._change_items_[castMark] &&
                role._change_items_[castMark] > 0 &&
                (role.getProp(castMark) > 0 || role.getProp(FREEMARK) == 0)
            ) {
                pushClient(role, { type: 'act', content: { [mode]: 1 } });
            };
        }
        // 积天豪礼
        const jthl = jthlRed(role, "zhd");
        if (jthl > 0) pushClient(role, { type: "act", content: { jthl } });
        const jthl1 = jthlRed(role, "forever");
        if (jthl1 > 0) pushClient(role, { type: "act", content: { jthl1 } });
        markChangeFn(role);
        hyhlPushRed(role);
        // 在GM后台配的活动通用红点推送
        const GM_EVENT = [
            "zslb", // 战神吕布
            "ny_shop", // 新春商店
            "yx_signin", // 元宵豪礼
        ];
        for (const event of GM_EVENT) {
            const tmp = global.ACTIVITY[event];
            let dot = tmp ? tmp.reddot(role) : 0;
            if (dot) pushClient(role, { type: 'act', content: { [event]: dot } });
        }
        // 限时兑换
        let xsdhDot = commomRed(role, "xsdh");
        if (xsdhDot > 0) pushClient(role, { type: "act", content: { xsdh: xsdhDot } });
        // 每日累冲
        if (role._change_items_[90221]) {
            let dot = daychargeRed(role)
            if (dot) pushClient(role, { type: "act", content: { daycharge: dot } })
        }
        // 许愿树
        if (isZhd.call(role, "xysh")) {
            const { num = 0 } = role.xysh || {};
            const { MARK, TOTAL } = global.gameconfig.zhd.XYSH || {};
            if (role._change_items_[MARK] > 0 && num < TOTAL) {
                pushClient(role, { type: "act", content: { xysh: 1 } });
            }
        }
        // 夺宝任务、秘境试炼
        dbrwPushRed(role, "dbrw")
        dbrwPushRed(role, "mjsl")
        if (isZhd.call(role, "xcrw")) {
            let tasks = global.gameconfig.zhd.XCRW.TASKS;
            let marks = tasks.map(({ PROCESS }) => PROCESS).reduce((sum, cur) => sum.concat(cur)).map(({ GSID }) => GSID)
            if (marks.some(mark => role._change_items_[mark])) {
                let dot = xcrwRed(role) || { xcrw: 0 }
                dot = dot.xcrw
                if (dot > 0) pushClient(role, { type: "act", content: { xcrw: dot } })
            }
        }
    },
    // 天降福星
    "TJFX": function (role, price) {
        if (!isZhd.call(role, "tjfx")) return;
        const { SCALE, LIMIT, GSID } = global.gameconfig.zhd.TJFX;
        const { TJFX_T: title, TJFX_C: content } = global.gameconfig.text;
        let used = role.tjfx || 0;
        const remain = Math.max(LIMIT - used, 0);
        if (remain == 0) return;
        const COUNT = Math.min(Math.ceil(price * SCALE / 10), remain);
        role.tjfx = used + COUNT;
        global.dao.mail.insertMany([{
            type: 2, rid: role.i(),
            reward: [{ GSID, COUNT }],
            title, content,
        }]).catch(console.error);
    },
    // 天降福星红点
    "TJFXRED": function (role, act) {
        if (!isZhd.call(role, "tjfx")) return;
        const { LIMIT } = global.gameconfig.zhd.TJFX;
        let used = role.tjfx || 0;
        const remain = Math.max(LIMIT - used, 0);
        console.log({ tjfx: role.tjfx, remain })
        if (remain > 0) {
            act.tjfx = 1;
        }
    },
    // 积天豪礼
    'JTHL': function (role, price, mode) {
        if (mode == "zhd" && !isZhd.call(role, "jthl")) return;
        const config = mode == "zhd" ? global.gameconfig.zhd.JTHL : global.gameconfig.jthl;
        // 当日累计已发限制(可能充值金额会出现1元,但应不能连续购买,故设置当日累计6元以下可以继续下面的逻辑)
        const {
            PRICE_EACH_ORDER, // 单笔金额限制
            MARK,   // 累计天数标记
            CMARK, // 活动期间每日充值标记
        } = config;
        if (role.getProp(CMARK) >= PRICE_EACH_ORDER) return;
        price = Number.parseInt(price);
        let marks = [
            { GSID: CMARK, COUNT: price },
        ]
        // 累积充值大于设定值则发放累计天数标记
        if (role.getProp(CMARK) + price >= PRICE_EACH_ORDER) {
            marks.push({ GSID: MARK, COUNT: 1 });
        }
        role.addItemsNoSave(marks);
        // 红点通知检查
        let dot = jthlRed(role, mode);
        if (dot) global.pushClient(role, { type: 'act', content: { [`${mode == "zhd" ? "jthl" : "jthl1"}`]: dot } });
    },
    // 积天豪礼红点
    'JTHLRED': function (role, mode) {
        return jthlRed(role, mode);
    },
    // 累计登录、登录豪礼活动期间计算累计登录值
    'LJDL': function (role) {
        for (const mode of LJDL_MODE) {
            if (!isZhd.call(role, mode)) continue;
            const { MARK } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
            let record = role[mode] || [];
            const sumLogin = role.getProp(90215);
            if (record[0] !== sumLogin) {
                role.addItemsNoSave({ gsid: MARK, count: 1 });
                record[0] = sumLogin;
                role[mode] = record;
                role.markModified(mode);
            }
        }
    },
    // 累计登录、登录豪礼红点
    'LJDLRED': function (role, act) {
        for (const mode of LJDL_MODE) {
            if (!isZhd.call(role, mode)) continue;
            const { MARK, ITEMS } = global.gameconfig.zhd_newhero[mode.toUpperCase()];
            const cur = role.getProp(MARK);
            const record = role[mode] || [];
            act[mode] = ITEMS.filter((_, index) => {
                let status = record[index + 1] == 1 ? 2 : (cur >= index + 1 ? 1 : 0);
                return status == 1;
            }).length;
        }
    },
    // 累计充值埋点
    'LJCZ': function (role, price) {
        ljczPoint(role, price, "ljcz");
        ljczPoint(role, price, "ljcz1");
        ljczPoint(role, price, "ljcz2");
        ljczPoint(role, price, "ljcz3");
        ljczPoint(role, price, "ljcz4");
    },
    // 连续累计充值埋点
    'LXLJCZ': function (role, price) {
        lxljczPoint(role, price, "lxljcz");
        lxljczPoint(role, price, "lxljcz1");
        lxljczPoint(role, price, "lxljcz2");
        lxljczPoint(role, price, "lxljcz3");
    },
    "HGLB": function (role) {
        hglbPoint(role, 'hglb1');
        hglbPoint(role, 'hglb2');
        hglbPoint(role, 'hglb3');
        hglbPoint(role, 'hglb4');
    },
    // 探囊取物标记埋点
    'TNQW': async function (role, times, index, tag) {
        index = index || 0;
        tag = tag || "tnqw";
        if (tag == "tnqw") return;
        if (!isZhd.call(role, tag)) return;
        let upTag = tag.toUpperCase();
        let config = global.gameconfig.zhd[upTag].SCORE[index];
        if (!config) return;
        let {
            MARK,
            NUMEACH,
            LIMIT,
        } = config;
        let count = Math.min(LIMIT - role.getProp(MARK), NUMEACH * times);
        if (count < 1) return;
        role.addItemsNoSave({ gsid: MARK, count });
        // 探囊取物长链接红点
        let canPush = await tnqwRed(role, tag);
        if (canPush) pushClient(role, { type: 'act', content: { [`${tag}`]: canPush } });
    },
    // 探囊取物红点
    "TNQWRED": async function (role, tag) {
        return await tnqwRed(role, tag);
    },
    // 龙帝赐福埋点
    'LDCF': function (role) {
        if (!isZhd.call(role, 'ldcf')) return;
        const { GSID, MARK } = global.gameconfig.zhd.LDCF;
        let isMarked = false;
        for (const { gsid } of role.newg) {
            if (GSID != gsid) continue;
            // 重生获得的武将不计入
            if (role.dontmarklist.includes(gsid)) continue;
            role.addItemsNoSave({ GSID: MARK, COUNT: 1 });
            isMarked = true;
        }
        if (!isMarked) return;
        // 长连接红点
        let lcdfCount = ldcfReward(role);
        if (lcdfCount < 1) return;
        pushClient(role, { type: 'act', content: { ldcf: lcdfCount } });
    },
    // 龙帝赐福可领取的奖励次数
    'LDCFREWARD': function (role, checkTime = true) {
        return ldcfReward(role, checkTime);
    },
    // 神装合成红点
    'SZHCRED': function (role) {
        let key = role.isXS('xs_szhc') ? 'xs_szhc' : 'szhc';
        if (isZhd.call(role, key)) {
            if (role.isXS('xs_szhc')) key = role.isXSConKey(key);
            return global.gameconfig.zhd[key.toUpperCase()].filter(({ LIMIT }, i) => {
                return LIMIT - (role.szhc[i] || 0) > 0;
            }).length;
        }
        return 0;
    },
    // 招募祈愿红点
    'ZMQYRED': function (role) {
        if (isZhd.call(role, "zmqy")) {
            let zmqy = role.zmqy || {};
            const { GNUM_MAX } = global.gameconfig.zhd.ZMQY;
            if (Object.keys(zmqy).length == 0 || !zmqy.gsidlist || zmqy.gsidlist.length < GNUM_MAX) return true;
        }
        return false;
    },
    // 周末福利红点
    'ZMFLRED': function (role) {
        let { ITEMS: config, TESTWEEK } = global.gameconfig.zmfl;
        for (let i = 0; i < config.length; i++) {
            let bought = role.zmfl[i] || 0;
            let now = TESTWEEK ? moment(TESTWEEK) : moment();
            if (bought == 0 && zmflIsTime(now, config[i].WEEK) == 1) {
                return true;
            }
        }
        return false;
    },
    // 周末福利领取状态
    'ZMFLTIME': zmflIsTime,
    // 限时兑换红点
    'XSDHRED': function (role) {
        return commomRed(role, "xsdh");
    },
    // 限购礼包红点
    'CJXG1RED': function (role) {
        return commomRed(role, "cjxg1", items => role.vip >= items.VIP);
    },
    // 神兵降临红点
    "SBJLRED": function (role) {
        return commomRed(role, "sbjl");
    },
    "SMBXRED": function (role) {
        return commomRed(role, "smbx", items => role.vip >= items.VIP);
    },
    // 积分宝箱埋点
    "JFBX": function (role, times, _mark) {
        let key = role.isXS('xs_jfbx') ? 'xs_jfbx' : 'jfbx';
        if (isZhd.call(role, key)) {
            if (role.isXS('xs_jfbx')) key = role.isXSConKey(key);
            let { EVENT: event } = global.gameconfig.zhd[key.toUpperCase()];
            let totalLimit = event.map(({ LIMIT }) => LIMIT).reduce((sum, cur) => sum + cur, 0);
            let totalScore = event.map(({ MARK }) => role.getProp(MARK)).reduce((sum, cur) => sum + cur, 0);
            if (totalScore >= totalLimit) return;
            let config = event.filter(({ MARK }) => MARK == _mark);
            let _event = config[0];
            if (!_event) return;
            // NUM为0的事件,在相应的礼包里面已经配置好分数
            let num = _event.NUM == 0 ? 1 : _event.NUM;
            let markCount = role.getProp(_mark);
            if (markCount >= _event.LIMIT) return;
            let del = Math.min(_event.LIMIT - markCount, times * num);
            role.addItemsNoSave({ GSID: _mark, COUNT: del });
            // 长连接红点
            let dot = jfbxRed(role);
            if (dot > 0) pushClient(role, { type: 'act', content: { jfbx: dot } });
        }
    },
    // 积分宝箱短链接红点
    "JFBXRED": function (role) {
        return jfbxRed(role);
    },
    // 活跃豪礼红点
    "HYHLRED": function (role, mode = "hyhl") {
        return hyhlRed(role, mode);
    },
    // 点将任务
    "DJRW": function (role) {
        let key = role.isXS(`xs_djrw`) ? `xs_djrw` : 'djrw';
        if (!isZhd.call(role, key)) return;
        if (role.isXS('xs_djrw')) key = role.isXSConKey(key);
        let {
            PMARKS: pmarks,
            MISSIONS,
        } = global.gameconfig.zhd[key.toUpperCase()] || {};
        let isHit = false;
        for (let g of role.item_tmp) {
            if (g.dontmark) continue;
            let config = global.gameconfig.general[g.GSID || g.gsid];
            if (!config) continue;
            if (config.STAR < 5) continue;
            let mark = pmarks[config.CAMP - 1];
            if (!mark) continue;
            role.addItemsNoSave({ GSID: mark, COUNT: g.COUNT || g.count });
            isHit = true;
        }
        if (!isHit) return;
        let dot = MISSIONS.filter(({ MARK, CHK }) => role.getProp(MARK) == 0 && CHK.every(({ MARK, NUM }) => role.getProp(MARK) >= NUM)).length;
        if (dot > 0) pushClient(role, { type: 'jchd', content: { djrw: dot } })
    },
    "DZLBRED": function (role) {
        if (!isZhd.call(role, "dzlb")) return 0;
        let record = role.dzlb || {};
        return global.gameconfig.dzlb
            .filter(({ VIPRANGE: [MIN] }) => role.vip >= MIN)
            // 红点数为每项剩余限购次数总和
            .map(({ LIMIT, ID }) => LIMIT - (record[ID] || 0))
            .reduce((sum, cur) => sum + cur, 0);
    },
    // 鸿运当头初始化红包
    "HYDTINIT": async function (type, start, newRole) {
        if (type.toUpperCase() != "HYDT") return;
        let mode = "ACT_UPD";
        let now = Date.now();
        if (!isZhd.call(null, "hydt")) return;
        if (!start) {
            start = now;
            mode = "USER_CREATE";
        }
        const { INIT } = global.gameconfig.zhd.HYDT;

        let totalNum = 0;
        if (!newRole) {
            await utilCursor(global.dao.role.find({ hydt: { $exists: 0 } }, { hydt: 1, 'hide.38001': 1 }), async (role, index) => {
                await hydtRefPack(role, start, INIT, now);
                totalNum = index;
            })
        }
        else {
            totalNum = 1;
            // 单人操作
            await hydtRefPack(newRole, start, INIT, now);
        }
        console.error(`HYDTINIT ${mode} END TOTAL`, totalNum, "COST", (Date.now() - now) / 1000, "s", new Date().toLocaleString());
    },
    // 鸿运当头刷新红包
    "HYDTREFRESH": async function () {
        if (!isZhd.call(null, "hydt")) return;
        let now = Date.now();

        await utilCursor(global.dao.role.find({ hydt: { $exists: 1 } }, { hydt: 1, 'hide.38001': 1 }), async (role) => {
            await hydtRefPack(role, now, null, now);
        })

        console.error("HYDTREFRESH END", "COST", (Date.now() - now) / 1000, "s", new Date().toLocaleString());
    },
    // 每日累充
    "DAYCHARGEREF": async function () {
        let { ITEM } = global.gameconfig.daycharge || {}
        const { DAYCHARGE_T: title, DAYCHARGE_C: content } = global.gameconfig.text
        if (!ITEM) return
        // 邮件补偿

        let MRSC = global.gameconfig.mrsc;
        const mails = []

        await utilCursor(global.dao.role.find({
            "others.90221.count": { $gt: 0 },
        }, { "others.90221": 1, daycharge: 1, mrsc: 1 }), async (role) => {
            const record = role.daycharge || [];
            const reward = []
            ITEM.forEach(({ MONEY, REWARD }, index) => {
                if (!record[index] && role.getProp(90221) >= MONEY) {
                    reward.push(...REWARD)
                }
            })

            if (reward.length > 0) mails.push({
                type: 2, rid: role.i(), reward: reward.arrange(),
                title, content,
            })

            //每日首充
            {
                reward.splice(0, reward.length);
                const mrscrecord = role.mrsc || [];
                MRSC.ITEMS.forEach(({ PRICE: price, ITEMS: items }, index) => {
                    if (!mrscrecord[index] && role.getProp(90221) >= price) {
                        reward.push(...items)
                    }
                })

                if (reward.length > 0) mails.push({
                    type: 2, rid: role.i(), reward: reward.arrange(),
                    title: MRSC.MTITLE, content: MRSC.MCONTENT,
                })
            }
            //---------------------每日首充

            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails).catch(console.error.bind("", "SCHEDULEREF refdaily daycharge return"));
                mails.splice(0, mails.length);
            }
        });

        if (mails.length > 0) global.dao.mail.insertMany(mails)
            .then(_ => console.error("SCHEDULEREF refdaily daycharge return", new Date().toLocaleString()))
            .catch(console.error)
    },
    // 夺宝任务埋点
    "DBRW": function (role, mark, count = 1, isGSID = false) {
        let modes = ["dbrw", "mjsl"];
        for (let mode of modes) {
            if (!isZhd.call(role, mode)) continue;
            if (!global.gameconfig.zhd[mode.toUpperCase()]) continue;
            const tasks = global.gameconfig.zhd[mode.toUpperCase()].TASKS;
            if (isGSID) { // 直接消耗或增加道具的任务
                const fn = (change, mark1, mark2) => {
                    const task1 = tasks.find(({ MARK }) => mark1 == MARK);
                    const task2 = tasks.find(({ MARK }) => mark2 == MARK);
                    let ch = Math.abs(change);
                    if (task1) taskPoint(role, mark1, 0xffff, ch); // 因为领取记录存在 16位以上，所以数值不能超过16位
                    if (task2) taskPoint(role, mark2, 0xffff, ch);
                }
                let ybChange = role._change_items_[38005];
                if (ybChange < 0) { // 消耗元宝
                    fn(ybChange, 90585, 90586);
                }
                let hydChange = role._change_items_[93012];
                if (hydChange > 0) { // 活跃度获得
                    fn(hydChange, 90587, 90588);
                }
                return;
            }
            const task = tasks.find(({ MARK }) => mark == MARK);
            if (!task) return;
            taskPoint(role, mark, 0xffff, count); // 因为领取记录存在 16位以上，所以数值不能超过16位
        }
    },
    /**
     * 新春活动埋点
     * 检查
     * @param {dao.role} role
     */
    'XCRW_ROLE': function (role) {
        if (!isZhd.call(role, 'xcrw')) return;
        let is_push = false;
        // 元宝消耗
        let ybConsume = role._change_items_[38005];
        if (ybConsume < 0) {
            is_push = true;
            ybConsume = Math.abs(ybConsume);
            role.addItemsNoSave({ gsid: 94802, count: ybConsume });
            role.addItemsNoSave({ gsid: 94804, count: ybConsume });
        }
        // 日常功勋获得
        let gloryAcquire = role._change_items_[93012];
        if (gloryAcquire > 0) {
            is_push = true;
            role.addItemsNoSave({ gsid: 94805, count: gloryAcquire });
        }
    },
    'XCRW_CHARGE': function (role, amount) {
        if (!isZhd.call(role, 'xcrw')) return;
        role.addItemsNoSave({ gsid: 94806, count: amount });
        let content = xcrwRed(role);
        if (content) pushClient(role, { type: 'act', content });
    },
    'XCRW_RED': xcrwRed,
    // 周活动需要每日刷的放在这里
    "DAILYREF": async function (roleset, roleunset) {
        // 幸运轮盘
        if (isZhd.call(null, "xylp")) {
            await global.dao.actstorage.updateMany({ mode: "xylp" }, { $set: { xylp_daymax: {} } });
            console.error(`SCHEDULEREF refdaily xylp`, new Date().toLocaleString());
        }
        // 周活动礼包中需要日刷的
        const REFRESH_EVENT = [
            'sglb', // 时光礼包
            "dbsd", // 夺宝商店
            "jhlb", // 钜惠礼包
            "jhlb1", // 钜惠礼包1
            "bjsr", // 补给商人
            'jnxl', // 购物满减(金牛献礼)
            'sdbj', // 圣诞笔记
            'sglb1', // 时光礼包
            'zjd', // 砸金蛋
            'sglb2'// 元旦礼包
        ]
        let cond = [];
        let $set = {};
        for (const event of REFRESH_EVENT) {
            if (!isZhd.call(null, event)) continue;
            let config = global.gameconfig.zhd_newhero[event.toUpperCase()] || global.gameconfig.zhd[event.toUpperCase()];
            if (event === 'jnxl') config = global.gameconfig.jnxl.LIST;
            if (!config) continue;
            if (Array.isArray(config)) {
                config.forEach(({ REFRESH }, index) => {
                    if (REFRESH == 1) {
                        $set[`${event}.${index}`] = 0;
                    }
                });
            }
            // sdbj,只重置进度sdbj.progress
            if (event === 'sdbj') {
                $set[`sdbj.progress`] = [];
            }

            // zjd,只重置进度zjd.progress
            if (event === 'zjd') {
                $set[`zjd.progress`] = [0, 0, 0, 0];
            }
            cond.push({ [event]: { $exists: 1 } });
        }
        await global.dao.role.updateMany({ $or: cond }, { $set });
        console.error(`SCHEDULEREF refdaily ${cond}`, new Date().toLocaleString());
        // 武圣挑战
        if (isZhd.call(null, "wstz")) {
            await global.dao.wstz.updateMany({}, { $set: { dailydamage: 0, dailycount: 0, dailyrecord: [] } })
            console.error(`SCHEDULEREF refdaily wstz`, new Date().toLocaleString());
        }
        // 招财进宝
        if (isZhd.call(null, "zcjb")) {
            if (roleunset) { // 优化，避免重复 全表更新
                roleunset.zcjb = 1;
            } else {
                await global.dao.role.updateMany({}, { $unset: { zcjb: 1 } })
            }
            console.error(`SCHEDULEREF refdaily zcjb`, new Date().toLocaleString())
        }
        // 元宵灯会日刷
        if (isZhd.call(null, "yxdh")) {
            if (roleunset) { // 优化，避免重复 全表更新
                roleunset.yxdh = 1;
            } else {
                await global.dao.role.updateMany({}, { $unset: { yxdh: 1 } })
            }
            console.error(`SCHEDULEREF refdaily yxdh`, new Date().toLocaleString())
        }

        // 活动模版
        const ACT_REFRESH_EVENT = [
            'ny_shop', // 新春活动-年货商店
        ]
        for (const event of ACT_REFRESH_EVENT) {
            if (!isZhd.call(null, event)) continue;

            const toUp = event.toUpperCase();
            const filter = 'act.' + toUp;
            const $unset = {};
            const { params = {} } = global.ACTIVITY[event] || {};
            // 重置奖励
            const notReset = ['proitem13', 'proitem14', 'proitem15', 'proitem16', 'proitem17']; // 某些商品不重置状态,策划给的标识
            Object.keys(params.reward || {}).map(key => { // 格式：proitem**
                if (toUp == 'NY_SHOP' && notReset.includes(key)) return;

                $unset[`${filter}.${key}`] = 1;
            });

            // 重置礼包
            Object.keys(params.sppack || {}).map(key => { // 格式：pack**
                $unset[`${filter}.${key}`] = 1;
            });

            // 重置抽奖
            if (params.lucky && params.lucky.items && params.lucky.items.length > 0) $unset[`${filter}.lucky`] = 1; // 格式：lucky

            console.error('==activity=> $unset =', $unset)
            await global.dao.role.updateMany({ [filter]: { $exists: 1 } }, { $unset });

            console.error(`SCHEDULEREF refdaily activity ${event}`, new Date().toLocaleString());
        }
    },
    // 登录游戏时活动的懒刷新
    "LAZYREF": async function (role) {
        // 直接领奖的活动，活动结束后未领取的邮件补偿
        const acts = [
            "zslb", // 战神吕布
        ]
        for (const a of acts) {
            const act = global.ACTIVITY[a];
            if (!act) continue;
            await act.rewardMail(role);
        }
        // 预约送武将活动结束后没领奖的玩家发邮件奖励
        let general_appointment_config = global.gameconfig.general_appointment || {};
        if (Object.keys(general_appointment_config).length == 0) return;
        const {
            END,
            MARK, ITEMS,
        } = general_appointment_config;
        const { GENERAL_APPOINTMENT_T: title, GENERAL_APPOINTMENT_C: content } = global.gameconfig.text;
        if (Date.now() > Date.parse(END) && role.getProp(MARK) == 0) {
            const reward = ITEMS.map(({ REWARD }) => REWARD).reduce((sum, cur) => sum.concat(cur));
            role.addItemsNoSave(MARK);
            global.dao.mail.insertMany([{
                type: 2, rid: role._id.toString(),
                title, content, reward,
            }]).catch(console.error);
        }
    },
    "ISZHD": function (key) {
        return isZhd.call(this, key);
    },
    zcjbRed,
    'SGZB': sgzbRed,
    "ZZTJJ_RED": function (type, role) {
        return zztjjRed(type, role);
    },
    "ZZTJJ_POINT": function (type, role) {
        return zztjjpoint(type, role);
    },
    "SDBJ_RED": function (role) {
        return sdbjRed(role);
    },
    "ZJD_RED": function (role) {
        return zjdRed(role);
    },
    "ZJD_POINT": function (role, mark, times) {
        return zjdpoint(role, mark, times);
    },
    "SYS_SUMCOUNT": function (role, actData) {
        const { items } = actData;
        // 统计数量
        let gsidTotalNum = {};
        for (let item of items) {
            let gsid = item.GSID || item.gsid;
            let count = parseInt(item.COUNT || item.count) || 0;
            if (!gsidTotalNum[gsid]) gsidTotalNum[gsid] = 0;
            gsidTotalNum[gsid] += Math.abs(count);
        }
        if (gsidTotalNum[38005]) {
            let id = "xhyxhb"
            const zhd = global.config.ZHD[id.toUpperCase()];
            const [start, end] = zhd;
            let now = Date.now()
            if (now < end && start < now) {
                //标记每日消耗
                role.addItemsNoSave([{ gsid: global.gameconfig[id][0][1].key, count: gsidTotalNum[38005] }])
            }
        }
    },
    "XHY_RANK": async function (role) {
        let id = "xhyxhb"
        let groupid = role._gameserv.groupid;
        const zhd = global.config.ZHD[id.toUpperCase()];
        const [start, end] = zhd;
        if (ACTIVITY[id] && Date.in(start, end)) {
            let rankService = new global.services.RankService(`${id}-${global.gameconfig[id][0][1].key}`, groupid);
            let score = Math.ceil(role.getItems(global.gameconfig[id][0][1].key).count)
            await rankService.set({
                id: role.i(),
                score: score
            });
        }
    },
    /**
     * 累计型活动
     * @param {*} role
     * @param {*} actData { type: 0, items: [{gsid:0,count:0},..], reason:{}}; PS: type // 0-消耗 1-增加
     * @returns
     */
    "ACCUMUL": async function (role, actData) {
        const { items, reason, type } = actData;
        // 去除拍卖途径的消耗
        if (reason && reason.main == 'auction') return;

        // 累计类型活动列表
        const ACCUMUL_MODES = [
            "YD_XFYL",  // 元旦消费有礼
            "YD_XFYL2",  // 元旦消费有礼
        ]

        // 统计数量
        let gsidTotalNum = {};
        for (let item of items) {
            let gsid = item.GSID || item.gsid;
            let count = parseInt(item.COUNT || item.count) || 0;
            if (!gsidTotalNum[gsid]) gsidTotalNum[gsid] = 0;
            gsidTotalNum[gsid] += Math.abs(count);
        }
        for (let mode of ACCUMUL_MODES) {
            // 活动是否开启
            if (!isZhd.call(role, mode)) continue;


            const toUp = mode.toUpperCase();
            const configs = global.gameconfig.zhd_newhero[toUp] || global.gameconfig.zhd[toUp];

            if (!configs) {
                console.error('ACCUMUL configs = ', configs, toUp)
                continue;
            }

            const $inc = {};
            const hdtype = mode.toLowerCase();
            const filter = {
                rid: role.i(),
                hdtype,
                subtype: 0
            }
            const tmp = {}; // 初始化计数
            // 查询那些条件要累计
            configs.map(elem => {
                const { CONDS, SUBTYPE } = elem;
                // 累计类型是否一致
                if (SUBTYPE !== type) return;

                filter.subtype = +SUBTYPE || 0;
                CONDS.map(cond => {
                    if (!cond) return;
                    let addNum = gsidTotalNum[cond.COND] || 0;
                    if (!!addNum && !tmp[cond.COND]) tmp[cond.COND] = +addNum;
                    if (!!addNum && !$inc[`totals.${cond.COND}`]) $inc[`totals.${cond.COND}`] = +addNum;
                });
            });

            if (Object.keys($inc).length < 1) continue;
            let info = await global.dao.accumulgoodfixs.findOne(filter);
            if (!info) {
                info = await global.dao.accumulgoodfixs.create({ ...filter, totals: tmp, rewardtime: [] })
            }
            else {
                await global.dao.accumulgoodfixs.updateOne(filter, { $inc });
                info = await global.dao.accumulgoodfixs.findOne(filter);
            }
            // 查找并更新次数
            //let info = await global.dao.accumulgoodfixs.findOneAndUpdate(filter, { $inc }, { upsert: true, new: true });

            let list = await info.rewardstatus();

            // 查找任务状态为1的
            let meets = list.filter(elem => elem && elem.status == 1);
            if (meets.length > 0) pushClient(role, { type: "act", content: { [hdtype]: meets.length } });
        }
    },
    "SDBJ_POINT": function (role, mark, time) {
        return sdbjpoint(role, mark, time);
    },
    "FUDAI_RED": async function (role, make) {

        const toUp = make.toUpperCase();
        // 活动是否开启
        if (!isZhd.call(role, toUp)) return;

        const config = global.gameconfig.zhd[toUp] || global.gameconfig.zhd_newhero[toUp];
        if (!config) return

        if (!role.fudai || !role.fudai[make]) return;

        const { buycount = [], rewardtime = [], buyindex } = role.fudai[make];

        // 是否有可领取的奖励
        const { REWARDS: rwds } = config;
        const curNum = buyindex || buycount.filter(elem => elem).length; // buyindex 表示购买到第几个福袋
        let arr = rwds.map((elem, index) => rewardtime[index] ? 2 : curNum >= elem.COND ? 1 : 0) //未完成/可领取/已领取
        arr = arr.filter(elem => elem == 1);
        if (arr.length > 0) pushClient(role, { type: "act", content: { [make]: arr.length } });
        return arr.length;
    },
    "YCCB_RED": function (role) {
        return yccbRed(role);
    },
    "XCZC_RED": function (role) {
        return xczcRed(role);
    },
    "YXDH_RED": function (role) {
        return yxdhRed(role);
    },
    "WARORDER_RED": function (role, warorder) {
        let count = warorderRed(role, warorder);
        pushClient(role, { type: "act", content: { 'warorder': count } });
    },
    "JFHD_RED": function (role, hd) {
        let jchdCanRecCount = {};
        jchdCanRecCount[hd] = 0;
        let TYPE = (role.isXS('xs_' + hd) ? 'xs_' + hd : hd).toUpperCase();

        if (global.config.ZHD[TYPE]) {
            if (!Date.in(...global.config.ZHD[TYPE])) {
                return
            }
        }
        if (role.isXS('xs_' + hd)) TYPE = role.isXSConKey(TYPE).toUpperCase();
        const config = global.gameconfig.zhd[TYPE];
        if (!config || !config.MISSIONS) {
            return;
        }
        const { MISSIONS, MARK, LOOPLIMIT } = config;
        let looplimit = LOOPLIMIT[role.vip];
        let cycleScore = _.last(MISSIONS).NUM;
        // 可计算分限制在可用循环内
        let curScore = role.getProp(MARK);
        curScore = Math.min(curScore, looplimit * cycleScore);

        let currentloop = Infinity; // 当前正在进行的 loop 值
        MISSIONS.forEach(m => { currentloop = Math.min(currentloop, role.getProp(m.MARK)) });
        currentloop = Math.min(currentloop, looplimit);
        let missions = MISSIONS.map(mission => {
            let {
                MARK: rewardMark,
                NUM,
            } = mission;
            let markNum = role.getProp(rewardMark);
            let thiscur = curScore - Math.min(currentloop, looplimit - 1) * cycleScore;
            thiscur = Math.min(thiscur, NUM);
            return {
                status: (markNum > currentloop || markNum >= looplimit) ? 2 : (thiscur < NUM) ? 0 : 1
            }
        }).filter(mission => mission.status == 1)
        jchdCanRecCount[hd] = missions ? missions.length : 0;
        pushClient(role, { type: "jchd", content: jchdCanRecCount });
    },
    ZHENBAO_FUND,
}

// 周活动事件埋点任务
module.exports = function (task, ...argv) {
    const fn = tasks[task];
    if (!fn) console.warn('MISS POINT TASK', task);
    return fn.call(this, ...argv);
}


