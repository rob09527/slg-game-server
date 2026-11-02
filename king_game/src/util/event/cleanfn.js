const commomsend = require('../commonsend');
const tg = require('../textgetter');
const _type = require('../../model/role/common/type');
const jfend = require('./jfend');
const zhdpoint = require('./point');
const utilCursor = require('../../util/cursor');
const moment = require('moment');
const getBeforWeekDays = require('./getBeforWeekDays');
const _ = require('lodash');

// 招募积分
const zmjf = jfend.bind(null, 'zmjf');

// 观星达标
const gxdb = jfend.bind(null, 'gxdb');


const clean = function (tag) {
    console.error(`SCHEDULEREF tnqwbossclean ${tag}`, new Date().toLocaleString());
    global.dao.tnqwboss.remove({ tag }).catch(console.error);
}
const cleanActStorage = function (mode) {
    global.dao.actstorage.remove({ mode })
        .then(_ => console.error(`SCHEDULEREF clean c_luckrouletter ${mode}`))
        .catch(console.error);
}

const gjdlClean = async function (mode) {
    const up = mode.toUpperCase();
    await global.dao.role.clearActMark(mode, global.gameconfig[`zhd_${mode}`] || global.gameconfig.zhd[up]);
}

const tnqwClean = clean.bind(null, "tnqw");
const sslxClean = clean.bind(null, "sslx");

const ljczReturn = async function (ljcz) {
    // 累计充值结束后没领取的奖励需要通过邮件发给玩家
    const { ITEMS, MARK } = global.gameconfig.zhd_newhero[ljcz.toUpperCase()];
    const markType = _type(MARK);
    let cond = {
        [`${markType}.${MARK}`]: {
            $exists: 1,
        }
    }
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[ljcz.toUpperCase()]) {
        // 不是特殊新手活动则校验是否是新手保护期
        cond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
    }

    let mails = [];

    await utilCursor(global.dao.role.find(cond, { [`${markType}.${MARK}`]: 1, [ljcz]: 1 }), async (role) => {
        const money = role.getItems(MARK).count;
        const record = role[ljcz] || [];
        let reward = [];
        for (let i = 0; i < ITEMS.length; i++) {
            if (money >= ITEMS[i].NUM && !record[i]) {
                reward.push(...ITEMS[i].ITEMS)
            }
        }
        reward = reward.arrange();
        if (reward.length < 1) return;
        mails.push({
            type: 2,
            rid: role._id,
            title: tg('LJCZ_RETURN_T'),
            content: tg('LJCZ_RETURN_C'),
            reward,
        });

        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails).catch(console.error);
            mails.splice(0, mails.length);
        }

    })

    if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
    let set = { $unset: {} }
    set.$unset[`${markType}.${MARK}`] = 1;
    set.$unset[ljcz] = 1;
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${ljcz.toUpperCase()} END`, new Date().toLocaleString());
}

const lxljczReturn = async function (lxljcz) {
    // 连续充值结束后没领取的奖励需要通过邮件发给玩家
    const { ITEMS, FULL, TITLE, CONTENT } = global.gameconfig.zhd_newhero[lxljcz.toUpperCase()];
    let cond = {
        [`${lxljcz}`]: {
            $exists: 1,
        }
    }
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[lxljcz.toUpperCase()]) {
        // 不是特殊新手活动则校验是否是新手保护期
        cond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
    }

    let mails = [];

    await utilCursor(global.dao.role.find(cond, { [lxljcz]: 1 }), async (role) => {
        const record = role[lxljcz] || { task: [] };
        let reward = [];
        let cur = 0;
        ITEMS.forEach((value, i) => {
            let task = record.task[i];
            if (task && task.num >= value.NUM) {
                cur++;
                if (!task.got) {
                    reward.push(...value.ITEMS)
                }
            }
        })
        //23/3/13 策划去掉
        // if (record.all && !record.all.got && cur == ITEMS.length) {
        //     reward.push(...FULL.ITEMS);
        // }
        reward = reward.arrange();
        if (reward.length < 1) return;
        mails.push({
            type: 2,
            rid: role._id,
            title: TITLE,
            content: CONTENT,
            reward,
        });

        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails).catch(console.error);
            mails.splice(0, mails.length);
        }

    })

    if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
    let set = { $unset: {} }
    set.$unset[lxljcz] = 1;
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${lxljcz.toUpperCase()} END`, new Date().toLocaleString());
}

const SMZMXSReturn = async function (smzmxs) {
    console.log("神魔招募开始执行！！！！！！！！！！！！！！！！！！！！！！！！！！！")
    // 连续充值结束后没领取的奖励需要通过邮件发给玩家
    const { SMFL } = global.gameconfig.zhd_newhero[smzmxs.toUpperCase()];
    let cond = {
        [`${smzmxs}`]: {
            $exists: 1,
        }
    }
    const {
        SPECIAL_XS,
    } = global.gameconfig.zhd_special_xs;
    if (!SPECIAL_XS[smzmxs.toUpperCase()]) {
        // 不是特殊新手活动则校验是否是新手保护期
        cond.create = {
            $lte: moment().add(-7, 'days').startOf('days').valueOf()
        }
    }

    let mails = [];

    await utilCursor(global.dao.role.find(cond, { [smzmxs]: 1 }), async (role) => {
        let curMoney = role[smzmxs].val;
        const record = role[smzmxs].smflrecord || [];
        let reward = [];
        SMFL.forEach((value, i) => {
            if (!record[i] && curMoney >= value.NUM) {
                reward.push(...value.ITEMS)
            }
        })
        if (reward.length < 1) return;
        mails.push({
            type: 2,
            rid: role._id,
            title: "",
            content: "",
            reward,
        });

        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails).catch(console.error);
            mails.splice(0, mails.length);
        }

    })

    if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
    let set = { $unset: {} }
    set.$unset[smzmxs] = 1;
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${smzmxs.toUpperCase()} END`, new Date().toLocaleString());
}

const vipzksdReturn = async function (vipzksd) {
    let set = { $unset: {} }
    set.$unset[vipzksd] = 1;
    let cond = {
        [`${vipzksd}`]: {
            $exists: 1,
        }
    }
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${vipzksd.toUpperCase()} END`, new Date().toLocaleString());
}

const fllbReturn = async function (key) {
    let set = { $unset: {} }
    set.$unset[key] = 1;
    let cond = {
        [`${key}`]: {
            $exists: 1,
        }
    }
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${key.toUpperCase()} END`, new Date().toLocaleString());
}

const hglbReturn = async function (key) {
    let set = { $unset: {} }
    set.$unset[key] = 1;
    let cond = {
        [`${key}`]: {
            $exists: 1,
        }
    }
    let { PROCESS, MARK } = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
    if (PROCESS) {
        PROCESS.forEach(value => {
            set.$unset[`others.${value.PMARK}`] = 1;
        })
    }
    if (MARK) {
        set.$unset[`others.${MARK}`] = 1;
    }
    global.dao.role.updateMany(cond, set).catch(console.error);
    console.error(`SCHEDULEREF ${key.toUpperCase()} END`, new Date().toLocaleString());
}

const thjjClean = async function (key) {
    let { ITEMS } = global.gameconfig.zhd[key.toUpperCase()] || {};
    if (!ITEMS) return;

    let mails = [];
    let day = ITEMS.length;

    await utilCursor(global.dao.role.find({ [`${key}.isbuy`]: { $exists: 1 } }, { [key]: 1, _id: 1 }), async (role) => {
        let items = []
        let num = role[key].num || 0;
        for (let i = 0; i < day; i++) {
            if (i < num) continue;
            items.push(ITEMS[i]);
        }
        if (items.length < 1) return;
        items = items.map(_items => _items[0]).arrange();
        mails.push({
            type: 2,
            rid: role._id.toString(),
            title: global.gameconfig.text[key.toUpperCase() + "_T"],
            content: global.gameconfig.text[key.toUpperCase() + "_C"],
            reward: items,
        })

        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails).catch(console.error);
            mails.splice(0, mails.length);
        }
    })
    if (mails.length > 0) await global.dao.mail.insertMany(mails);
    // 清空标记
    let set = { $unset: { [key]: 1 } }
    await global.dao.role.updateMany({}, set);
    console.error(`SCHEDULEREF ${key.toUpperCase()} END`, new Date().toLocaleString());
}
const zztjjReturn = async function (type, isws = 0) {
    if (isws) return;
    let key = isws ? `xs_zztjj_${type}`.toUpperCase() : `zztjj_${type}`.toUpperCase()
    let cond = {};
    let time;
    let [start, end] = [0, 0];
    if (isws) {
        const day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');
        cond.$or = getBeforWeekDays();
        // 新手开始到定时器执行时间的0点结束。周活动的结束时间一般不是上周配置开始时间的当天。比如这周五配置会在下周四23点59分结束。
        // 但是该定时器的执行时间是0点，所有该活动最后计算会多发一天奖励。所以结束时间与周活动一致，都是前一天。
        [start, end] = [day.startOf('days').valueOf(), moment().add(-1, 'days').startOf('days').valueOf()];
    } else {  // 新手保护，注册未到7天的不会玩到正式活动，所以排除掉
        cond.create = {
            $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
        }
        let zhd = global.config.ZHD[key];
        [start, end] = zhd;
    }

    try {
        time = moment(moment(end).format('YYYY-MM-DD')).diff(moment(start).format('YYYY-MM-DD'), 'days');
        if (time > 7) time = 7;
    } catch (error) {
        console.error(`SCHEDULEREF ${key}.toUpperCase()} TIME ERROR ${error}`, new Date().toLocaleString());
    }
    let mails = [];
    let key1 = `zztjj1_${type}`;
    if (type == 'dj' || type == 'gz') key1 = `zztjj_${type}`;
    await utilCursor(global.dao.role.find({ ...cond, [`${key1}.ispay`]: 1 }, {
        [key1]: 1, uid: 1, create: 1,
        _id: 1
    }), async (role) => {
        let key2 = isws ? role.isXSConLastWeekKey(key) : key;
        let config = global.gameconfig.zhd[key2.toUpperCase()];
        if (!config) return;
        let { ITEMS } = config;
        let items = []
        let record = role[key1] || {};
        let num = record.num || 0;
        num = time + 1 - num;
        if (num <= 0) return;
        items = ITEMS.map(item => {
            return {
                count: item.COUNT * num,
                gsid: item.GSID
            }
        })
        mails.push({
            type: 2, rid: role._id.toString(),
            title: tg('ZZTJJ_T'),
            content: tg('ZZTJJ_C'),
            reward: items,
        })

        if (mails.length > 1000) {
            await global.dao.mail.insertMany(mails).catch(console.error);
            mails.splice(0, mails.length);
        }
    })
    if (mails.length > 0) await global.dao.mail.insertMany(mails);

    // 清空标记
    let set = { $set: { [key1]: { ispay: 0, num: 0 } } }
    await global.dao.role.updateMany(cond, set);
    console.error(`SCHEDULEREF ${key} END`, new Date().toLocaleString());
}



module.exports = {
    // 花好月圆
    HHYY: function () {
        commomsend('/activityinfo/fmoon/clean', {})
            .then(() => console.error("SCHEDULEREF cleancommon hhyy", new Date().toLocaleString()))
            .catch(console.error);
    },
    // 欢聚一堂
    HJYT: function () {
        cleanActStorage("hjyt");
    },
    // 幸运轮盘
    XYLP: function () {
        cleanActStorage("xylp");
    },
    // 万众期待活动清理期待值
    WZQD: function () {
        commomsend('/activityinfo/total/del', { type: 'wzqd' })
            .then(() => console.error("SCHEDULEREF cleancommon wzqd", new Date().toLocaleString()))
            .catch(console.error);
    },
    // 挂机商店清理
    GJDL: async function () {
        await gjdlClean("gjdl");
    },
    // 欢庆商店清理
    HQSD: async function () {
        await gjdlClean("hqsd");
    },
    // 秘境宝阁
    MJBG: async function () {
        await gjdlClean("mjbg");
    },
    // 累计充值
    LJCZ: async function () {
        await ljczReturn("ljcz");
    },
    // 累计充值1
    LJCZ1: async function () {
        await ljczReturn("ljcz1");
    },
    // 累计充值2
    LJCZ2: async function () {
        await ljczReturn("ljcz2");
    },
    // 累计充值3
    LJCZ3: async function () {
        await ljczReturn("ljcz3");
    },
    // 累计充值4
    LJCZ4: async function () {
        await ljczReturn("ljcz4");
    },
    // 连续充值
    LXLJCZ: async function () {
        await lxljczReturn("lxljcz")
    },
    // 连续充值
    LXLJCZ1: async function () {
        await lxljczReturn("lxljcz1")
    },
    // 连续充值
    LXLJCZ2: async function () {
        await lxljczReturn("lxljcz2")
    },
    // 连续充值
    LXLJCZ3: async function () {
        await lxljczReturn("lxljcz3")
    },
    // 神魔招募限时
    SMZMXS1: async function () {
        await SMZMXSReturn("smzmxs1")
    },
    // vip折扣商店
    VIPZKSD1: async function () {
        await vipzksdReturn("vipzksd1")
    },
    // vip折扣商店
    VIPZKSD2: async function () {
        await vipzksdReturn("vipzksd2")
    },
    // vip折扣商店
    VIPZKSD3: async function () {
        await vipzksdReturn("vipzksd3")
    },
    // vip折扣商店
    VIPZKSD4: async function () {
        await vipzksdReturn("vipzksd4")
    },
    //返利礼包
    FLLB1: async function () {
        await fllbReturn("fllb1")
    },
    FLLB2: async function () {
        await fllbReturn("fllb2")
    },
    FLLB3: async function () {
        await fllbReturn("fllb3")
    },
    FLLB4: async function () {
        await fllbReturn("fllb4")
    },
    //惠顾礼包
    HGLB1: async function () {
        await hglbReturn("hglb1")
    },
    HGLB2: async function () {
        await hglbReturn("hglb2")
    },
    HGLB3: async function () {
        await hglbReturn("hglb3")
    },
    HGLB4: async function () {
        await hglbReturn("hglb4")
    },
    // 点将任务
    DJRW: async function (isws) {
        let {
            REFMARKS,
            MISSIONS,
        } = global.gameconfig.zhd[isws ? 'XS_DJRW' : 'DJRW'];
        let cond = {};
        if (isws) {
            //const day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');
            // 新手清理 查询7天前(NEW_ROLE_DAYS=7)的那一天注册的角色
            // cond.create = {
            //     $gte: day.startOf('days').valueOf(),
            //     $lte: day.endOf('days').valueOf()
            // }
            /**
             * 
             * 查询到28天前那天0点00分到23点59分注册的账号，第21 14 7 天那几天注册的账号
             * 
             */
            cond.$or = getBeforWeekDays();
        } else {  // 新手保护，注册未到7天的不会玩到正式活动，所以排除掉
            cond.create = {
                $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
            }
        }
        let cursor = global.dao.role.find(cond, { others: 1 }).cursor();
        let role;
        let mails = [];
        let beforeCHK = MISSIONS.filter(({ CHK }) => CHK.length === 1)
            .map(({ CHK }) => CHK)
            .reduce((pre, next) => pre.concat(next));
        while (role = await cursor.next()) {
            let reward = [];
            for (let index = 0; index < MISSIONS.length; index++) {
                let { MARK, CHK, ITEMS, } = MISSIONS[index];
                if (role.getProp(MARK) > 0) continue;
                let fullfill = false;
                if (index == MISSIONS.length - 1) {
                    // 最后一个完成所有任务，检查标记，不检查领取状态
                    fullfill = beforeCHK.every(({ MARK, NUM }) => {
                        return role.getProp(MARK) >= NUM;
                    })
                } else {
                    fullfill = CHK.every(({ MARK, NUM }) => {
                        return role.getProp(MARK) >= NUM;
                    })
                }
                if (fullfill) reward.push(...ITEMS);
            }
            if (reward.length > 0) mails.push({
                type: 2,
                rid: role._id,
                title: tg('DJRW_RETURN_T'),
                content: tg('DJRW_RETURN_C'),
                reward,
            });
            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails).catch(console.error);
                mails.splice(0, mails.length);
            }
        }
        if (mails.length > 0) global.dao.mail.insertMany(mails).catch(console.error);
        // 清空标记
        let set = { $unset: {} }
        for (let mark of REFMARKS) {
            set.$unset[`others.${mark}`] = 1;
        }
        await global.dao.role.updateMany(cond, set);
        console.error(`SCHEDULEREF DJRW END`, new Date().toLocaleString());
    },

    DJJF: async function (isws) {
        await jfend('DJJF', isws).catch(console.error);
    },
    CPJF: async function (isws) {
        await jfend('CPJF', isws).catch(console.error);
    },
    CPJF2: async function (isws) {
        await jfend('CPJF2', isws).catch(console.error);
    },
    CCJF: async function (isws) {
        await jfend('CCJF', isws).catch(console.error);
    },
    ZMJF: async function () {
        zmjf().catch(console.error);
    },
    GXDB: async function () {
        gxdb().catch(console.error);
    },

    // 龙帝赐福
    LDCF: async function () {
        let { LDCF: { REFMARKS, MARK, REWARDS } } = global.gameconfig.zhd;
        let cond = {
            [`others.${MARK}`]: {
                $exists: 1,
            }
        };
        let mails = [];
        await utilCursor(global.dao.role.find(cond, { others: 1, _id: 1 }), async (role) => {
            let buynum = zhdpoint('LDCFREWARD', role, false);
            if (buynum > 0) {
                let reward = REWARDS.map(({ GSID, COUNT }) => ({ GSID, COUNT: COUNT * buynum }));
                mails.push({
                    type: 2,
                    rid: role._id,
                    title: tg(`LDCF_RETURN_T`),
                    content: tg(`LDCF_RETURN_C`),
                    reward
                })
            }
            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails).catch(console.error);
                mails.splice(0, mails.length);
            }
        })

        if (mails.length > 0) await global.dao.mail.insertMany(mails);
        // 清空标记
        let set = { $unset: {} }
        for (let mark of REFMARKS) {
            set.$unset[`others.${mark}`] = 1;
        }
        await global.dao.role.updateMany(cond, set);
        console.error(`SCHEDULEREF LDCF END`, new Date().toLocaleString());
    },
    // 积分宝箱
    JFBX: async function (isws) {
        let { REFMARKS, BOX, EVENT, EVENTNAME } = global.gameconfig.zhd[isws ? 'XS_JFBX' : 'JFBX'];
        let cond = {};
        if (isws) {
            // const day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');           
            cond.$or = getBeforWeekDays();
        } else {
            cond.create = {
                $lte: moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days').startOf('days').valueOf()
            }
        }
        let mails = [];
        await utilCursor(global.dao.role.find(cond, { others: 1, _id: 1, jfbx: 1 }), async (role) => {
            let totalScore = EVENT.map(({ MARK }) => role.getProp(MARK)).reduce((sum, cur) => sum + cur, 0);
            let record = role.jfbx || [];
            let roleReward = [];
            BOX.forEach(({ SCORE, REWARD }, index) => {
                let status = record[index] == 1 ? 2 : (totalScore >= SCORE ? 1 : 0);
                if (status == 1) roleReward.push(...REWARD);
            })
            if (roleReward.length > 0) mails.push({
                type: 2,
                rid: role._id,
                title: tg(`COMMON_RETURN_T`, EVENTNAME),
                content: tg(`COMMON_RETURN_C`, EVENTNAME),
                reward: roleReward,
            });
            if (mails.length > 1000) {
                await global.dao.mail.insertMany(mails);
                mails.splice(0, mails.length);
            }
        });
        if (mails.length > 0) await global.dao.mail.insertMany(mails);
        // 清空标记
        let set = { $unset: { jfbx: 1 } }
        for (let mark of REFMARKS) {
            set.$unset[`others.${mark}`] = 1;
        }
        await global.dao.role.updateMany(cond, set);
        console.error(`SCHEDULEREF JFBX END`, new Date().toLocaleString());
    },

    // 探囊取物
    TNQW: function () {
        tnqwClean();
    },
    // 圣兽来袭
    SSLX: function () {
        sslxClean();
    },
    // 特惠基金
    THJJ: async function () {
        await thjjClean("thjj");
    },
    // 特惠基金1
    THJJ1: async function () {
        await thjjClean("thjj1");
    },
    JNXL: async function () {
        await global.dao.role.updateMany({}, { $unset: { jnxl: 1 } });
        console.error(`SCHEDULEREF JNXL END`, new Date().toLocaleString());
    },
    WSTZ: async function () {
        // todo 结算并清理common的数据
        // 清理活动记录
        await global.dao.wstz.deleteMany({})
        console.error(`SCHEDULEREF WSTZ END`, new Date().toLocaleString());
    },
    XYBZ: async function () {
        await global.dao.westerntreasure.deleteMany({})
        console.error(`SCHEDULEREF XYBZ END`, new Date().toLocaleString())
    },
    XYGX: async function () {
        // 幸运观星结束后清理观星缓存
        await global.dao.c_spin.updateMany({}, { $set: { refresh: 1 } });
        console.error(`SCHEDULEREF XYGX END`, new Date().toLocaleString())
    },
    // 周主题基金清理逻辑
    ZZTJJ_GZ: async function () {
        await zztjjReturn('gz')
    },
    ZZTJJ_DJ: async function () {
        await zztjjReturn('dj')
    },
    ZZTJJ_GX: async function () {
        await zztjjReturn('gx')
    },
    ZZTJJ_GJ: async function () {
        await zztjjReturn('gj')
    },
    // 新手zztjj
    XSZZTJJ_CLEAN: async function (type) {
        await zztjjReturn(type, 1);
    },
    // 元旦好运福袋
    YD_HYFD: async function () {
        const keyStr = 'fudai';
        let $unset = {
            [`${keyStr}.yd_hyfd`]: 1
        }
        await global.dao.role.updateMany({}, { $unset }).catch(console.error);
        console.error(`SCHEDULEREF ${keyStr} END`, new Date().toLocaleString());
    }
}
