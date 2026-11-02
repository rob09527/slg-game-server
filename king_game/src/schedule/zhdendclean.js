'use strict'

let _cleanfn = require('../util/event/cleanfn');
let _startfn = require('../util/event/startfn'); // 开始活动时执行的fn

const _type = require("../model/role/common/type");
const moment = require("moment");

// 特殊需要清理的字段
const EXT_FIELD_EVENTS = [
    "XYZM",
    "ZMQY", "DWLB", "WZQD",
    "LJDL", "LJDL1", "DZLB", "HJYT", "DLHL", "DLHL1",
    "TJFX", "JGKL", "XYSH", "HYDT",
    "HYHL", "ZCJB", "HYHL1", "HTZH",
    "SGZB", "DZLBRMB", "DZLBRMB2", "HZLH", "JRXGLB",
    "SDBJ", "ZJD", "JYBP", "YCCB", "XCZC", "YXDH"
]
// 不需要邮件补偿，且清理标记字段为REFMARKS的活动
const REFMARKS_EVENTS = [
    "YHSH", "HYHL", "HYHL1", "YHSH1", "CPJF", "CPJF2", "CCJF"
]

// 需要特殊清理的礼包活动的GSID
const EXT_EVENT_GSID = [
    { name: "DWLB", marks: [93409] }, // 端午礼包免费领取标记
];

// 使用了活动模版的活动事件 marks: 活动内使用到的标记&道具id，可放多个
const ACT_MODEL_EVENTS = [
    { name: 'NY_SHOP', marks: [98353] }, // 年货商店,PS: 98353-折扣标记
    { name: 'NY_SIGNIN', marks: [] }, // 新春签到
    { name: 'YX_SHOP', marks: [] }, // 元宵商店
    { name: 'YX_UPROAR', marks: [30123, 30124] }, // 大闹元宵 - 清除活动道具
    { name: 'YX_SIGNIN', marks: [98354] }, // 元宵豪礼,PS: 98354-累计登录天数标记
]

let _cleanmarks = async function (name, marks) {
    console.error('SCHEDULEREF cleanmarks', name, new Date().toLocaleString(), "marks:", JSON.stringify(marks));

    // 新手保护
    const defcond = {};
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[name.toUpperCase()]) {
        // 不是特殊新手活动则校验是否是新手保护期
        defcond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
    }

    let udp = {
        $unset: {}
    }
    let cond = {
        ...defcond,
        $or: []
    }
    for (let mark of marks) {
        const markType = _type(mark);
        mark = `${markType}.${mark}`;
        udp.$unset[mark] = 1;
        cond.$or.push({
            [mark]: { $exists: 1 }
        });
    };
    await global.dao.role.updateMany(cond, udp);
}

let _unsetfield = async function (name) {
    console.error('SCHEDULEREF unsetfield', name, new Date().toLocaleString());

    // 新手保护
    const cond = {};
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[name.toUpperCase()]) {
        // 不是特殊新手活动则校验是否是新手保护期
        cond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
    }
    cond[name] = { $exists: 1 };
    let udp = {
        $unset: {
            [name]: 1
        }
    }
    console.error('unsetfield SCHEDULEREF cond', cond, udp);
    // 清除元旦消费有礼活动数据
    if (name && name.toUpperCase().startsWith('YD_XFYL')) {
        await global.dao.accumulgoodfixs.deleteMany({ hdtype: name.toLowerCase() }).catch(console.error);
        return
    }
    await global.dao.role.updateMany(cond, udp).catch(console.error);
}

let _actModelField = async function (name, marks = []) {
    if (!name) return;

    const keyStr = `act.${name.toUpperCase()}`;
    let promises = marks.map(mark => {
        if (!mark || !!isNaN(+mark)) return;

        const markType = _type(mark);
        mark = `${markType}.${mark}`;
        console.error('ACT_MODEL_EVENT mark =', mark);
        return global.dao.role.updateMany({ [mark]: { $exists: true } }, { $unset: { [mark]: 1 } });
    });
    // 清除活动数据
    await global.dao.role.updateMany({ [keyStr]: { $exists: true } }, { $unset: { [keyStr]: 1 } }).catch(console.error);
    promises = promises.filter(e => e);
    // 清除活动标记
    if (promises.length > 0) {
        console.error('ACT_MODEL_EVENT promises.length =', promises.length);
        await Promise.all(promises).catch(console.error);
    }
    console.error(`SCHEDULEREF ${keyStr} END`, new Date().toLocaleString());
}


// 定时器
exports.name = "周活动结束清标记"; //

exports.children = async function () {
    console.error('INIT SCHEDULEREF ZHD CRON');
    const ZHD_ENTRIES = Object.entries(global.gameconfig.zhd).concat(Object.entries(global.gameconfig.zhd_newhero));
    global.ACTIVITY = await global.dao.activity.init(); // 初始化活动配置
    const baseTime = 4 * 60 * 60 * 1000;
    let randomTime = 5 * 60 * 1000;
    // const baseTime = 0;
    // let randomTime = 0;
    let tasks = [];
    let MARK_EVENTS = [];
    let tmp = new Set()
    for (let [key, val] of ZHD_ENTRIES) {
        if (tmp.has(key)) continue
        if (!val.CLEANMARKS && !val.REFMARKS) continue;
        let marks = val.CLEANMARKS;
        if (REFMARKS_EVENTS.includes(key)) marks = val.REFMARKS;
        if (!marks) continue;
        MARK_EVENTS.push({ name: key, marks });
        tmp.add(key)
    }
    MARK_EVENTS.push(...EXT_EVENT_GSID);
    for (let { name: event, marks } of MARK_EVENTS) {
        let [, end] = global.config.ZHD[event] ||
            (console.error('-- -- ----- MISS EVENT', event)) || [];
        if (!end || Date.now() > end) continue;	// 已结束活动不清理
        if (event.startsWith('XS_')) continue; // 新手活动特殊处理不需要这里执行
        const endTime = baseTime + Math.floor(Math.random() * randomTime) + end;
        tasks.push({
            cron: new Date(endTime),
            ID: 'CLEAR_MARK_' + event,
            name: '清理活动标记_' + event,
            main: _cleanmarks.bind(null, event, marks)
        })
    }
    let FIELD_EVENTS = [];
    for (let [key, val] of ZHD_ENTRIES) {
        if (!Array.isArray(val)) continue;
        FIELD_EVENTS.push(key);
    }
    FIELD_EVENTS.push(...EXT_FIELD_EVENTS);
    FIELD_EVENTS = new Set(FIELD_EVENTS)

    for (let event of FIELD_EVENTS) {
        let [, end] = global.config.ZHD[event] ||
            (console.error('----- -- MISS EVENT', event)) || [];
        if (!end || Date.now() > end) continue;	// 已结束活动不清理
        if (event.startsWith('XS_')) continue; // 新手活动特殊处理不需要这里执行
        const endTime = baseTime + Math.floor(Math.random() * randomTime) + end;
        tasks.push({
            cron: new Date(endTime),
            ID: 'CLEAR_FIELD_' + event,
            name: '清理活动字段_' + event,
            main: _unsetfield.bind(null, event.toLowerCase())
        })
    }
    for (let [event, fn] of Object.entries(_cleanfn)) {
        let [, end] = global.config.ZHD[event] ||
            (console.error('----- MISS EVENT', event)) || [];
        if (!end || Date.now() > end) continue;	// 已结束活动不清理
        const endTime = baseTime + Math.floor(Math.random() * randomTime) + end;
        tasks.push({
            cron: new Date(endTime),
            ID: 'CLEAR_' + event,
            name: '清理活动_' + event,
            main: fn
        })
    }

    // 清除使用了活动模版的活动事件
    for (let { name: event, marks } of ACT_MODEL_EVENTS) {
        let [, end] = global.config.ZHD[event] ||
            (console.error('----- MISS ACT EVENT', event)) || [];
        if (!end || Date.now() > end) continue;	// 已结束活动不清理
        const endTime = baseTime + Math.floor(Math.random() * randomTime) + end;
        tasks.push({
            cron: new Date(endTime),
            ID: 'CLEAR_ACT_' + event,
            name: '清理活动模块_' + event,
            main: _actModelField.bind(null, event, marks)
        })
    }

    for (const event in global.ACTIVITY) {
        let [, end] = global.config.ZHD[event.toUpperCase()] ||
            (console.error('----- MISS EVENT', event)) || [];
        const actConfig = global.ACTIVITY[event];
        if (!actConfig || !end || Date.now() > end) continue;	// 已结束活动不清理
        const expand = actConfig.getExpand();
        if (expand.MARK) { // 如果又在后台配置标记的活动需要注册结束标记清理
            const endTime = baseTime + Math.floor(Math.random() * randomTime) + end;
            console.error('ADD SCHEDULEREF CLEAR MARK', event);
            tasks.push({
                cron: new Date(endTime),
                ID: 'CLEAR1_' + event,
                name: '清理活动1_' + event,
                main: async () => {
                    await global.dao.role.clearActMark(event, expand);
                }
            })
        }
    }

    // 开始活动前执行逻辑
    for (let [event, fn] of Object.entries(_startfn)) {
        let [start,] = global.config.ZHD[event] ||
            (console.error('----- MISS EVENT', event)) || [];
        if (Date.now() >= start) continue;	// 已开始的活动不清理
        tasks.push({
            cron: new Date(start),
            ID: 'START_' + event,
            name: '开始活动时执行逻辑_' + event,
            main: fn
        })
    }

    console.error('ADD SCHEDULEREF ACTIVITY', global.ACTIVITY);

    return tasks;
}

