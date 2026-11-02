'use strict';
const zhdreward = require('../../../util/zhdreward');
const { welDot } = require("../../../util/weektarget");
const { smsRed } = require("../../../util/event/smanskin");
const moment = require("moment");
const _ = require('lodash');

/**
 * 红点提醒
 * @param ctx{ object}
 */
module.exports = exports = async (ctx) => {

    let res = await global.services.RemindService.find("remind:" + ctx.role._id);
    if (res && Object.keys(res).length) return ctx.body = res;
    const _new = Date.now();
    const role = ctx.role;
    const owner = ctx.role.i();
    role.cast_items = [];
    //
    role.castItemsNoSave = _ => { // 替换原有 castItems逻辑,因为不能对 role本来的 属性进行处理
        const items = (Array.isArray(_) ? _ : [_]).map(it => (it.GSID || it.gsid) ? it : { GSID: it, COUNT: 1 });
        role.cast_items.push(...items);
        role.cast_items = role.cast_items.arrange();
        for (let item of role.cast_items) {
            const gsid = item.GSID || item.gsid;
            const count = item.COUNT || item.count || 1;
            if (role.getProp(gsid) < count) {
                assert.fail('gsid not enough');
            }
        }
    };
    const virtualExec = (...param) => { // 包装兑换规则检验
        let bl;
        try {
            ctx.khexec(...param);
            bl = true;
        } catch (e) {
            bl = false;
        } finally {
            role.cast_items = []; // 每次兑换规则操作完毕 清空消耗，避免对其他兑换检验有影响
        }
        return bl;
    };

    role.addItemsNoSave = _ => _; // 屏蔽原有的实例方法
    role.save = async _ => _; // 屏蔽原有的实例方法

    const friendTotal = ctx.role.friends ? ctx.role.friends.length : 0;
    const mailCount = await ctx.dao.mail.countDocuments({
        rid: ctx.role._id,
        state: 0,
        create: { $gte: _new - 30 * 24 * 60 * 60 * 1000 },
    });
    const mail = {
        mail: mailCount,
    };
    const friendApplyCount = await ctx.dao.apply.countDocuments({
        type: 'friend',
        to: ctx.role._id,
        create: { $gte: _new - 24 * 60 * 60 * 1000 },
    });

    // 可领取好友赠送数量
    const { DAILYPRECE } = global.gameconfig.others.FRIEND;
    const avaliable = DAILYPRECE - ctx.role.getItems(90308).count;
    const allPointCount = await ctx.dao.fpoint.countDocuments({ take: { $exists: false }, to: ctx.role._id });
    const friendPointCount = avaliable > allPointCount ? allPointCount : avaliable;

    // 好友可赠送数量
    const allSendCount = await ctx.dao.fpoint.countDocuments({ rid: ctx.role._id });
    const canSend = friendTotal - allSendCount;
    const { DAILYPSEND } = global.gameconfig.others.FRIEND;
    const sendAvaliable = DAILYPSEND - ctx.role.getItems(90263).count;
    const friendSendCount = canSend > sendAvaliable ? sendAvaliable : canSend;

    const friend = {
        apply: friendApplyCount,
        fpoint: friendPointCount > 0 ? friendPointCount : 0,
        send: friendSendCount > 0 ? friendSendCount : 0,
    };

    // 精彩活动可领取数量
    const jchdCanRecCount = {};


    const mCtx = {
        role,
        assert: global.assert,
        isRemind: true,
    };

    // 精彩活动提醒
    const jchd = ['zmjf', 'djjf', 'gxdb', 'cpjf', 'cpjf2', 'ccjf'];

    for (const hd of jchd) {
        jchdCanRecCount[hd] = 0;
        let TYPE = (role.isXS('xs_' + hd) ? 'xs_' + hd : hd).toUpperCase();

        if (global.config.ZHD[TYPE]) {
            if (!Date.in(...global.config.ZHD[TYPE])) {
                continue;
            }
        }
        if (role.isXS('xs_' + hd)) TYPE = role.isXSConKey(TYPE).toUpperCase();
        const config = global.gameconfig.zhd[TYPE];
        if (!config || !config.MISSIONS) {
            continue;
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
    }
    // 特殊处理点将积分活动
    jchdCanRecCount.djrw = 0;
    let __djrwConfig;
    if ((__djrwConfig = global.gameconfig.function_luck['ACTIVITY_ZHD_DJRW']) && role.getProp(__djrwConfig.REQUIRE_NAME) >= __djrwConfig.REQUIRE_COUNT) {
        try {
            let TYPE = (ctx.role.isXS('XS_DJRW') ? 'xs_' + 'DJRW' : 'DJRW').toUpperCase();
            TYPE = role.isXS('XS_DJRW') ? role.isXSConKey(TYPE).toUpperCase() : TYPE.toUpperCase();
            const config = global.gameconfig.zhd[TYPE] || {};
            const MISSIONS = config.MISSIONS || [];
            MISSIONS.forEach(mission => {
                let {
                    CHK,
                    MARK
                } = mission;
                if (ctx.role.getProp(MARK) < 1) {
                    let fullfill = CHK.every(({ MARK, NUM }) => {
                        return ctx.role.getProp(MARK) >= NUM;
                    })
                    if (fullfill) {
                        jchdCanRecCount.djrw++;
                    }
                }
            })
        } catch (e) {
            console.error('dbrw', e);
        }
    }

    mCtx.request = { body: {} };

    // 新兵营 提醒
    const xby = { zytz: 0, ryzl: 0, xsry: 0 };
    for (let i = 0; i < 12; i++) {
        if (virtualExec(ctx.role, 'novice_zhnayi_' + i, 1)) {
            xby.zytz++; // 有可以领取的战役奖励
        } else {
        }
    }
    for (let i = 0; i < 10; i++) {
        if (virtualExec(ctx.role, 'novice_rongyao_' + i, 1)) {
            xby.ryzl++; // 有可以领取的成就奖励
        } else {
        }
    }

    for (let i = 0; i < 12; i++) {
        if (virtualExec(ctx.role, 'novice_xuanshang_' + i, 1)) {
            xby.xsry++; // 有可以领取的悬赏
        } else {
        }
    }
    // 大战役
    const bigbattle = {};
    const bigChapterKey = ['sm', 'lvlin', 'ks'];
    // 副本免费挑战次数红点
    for (const bigFree of global.gameconfig.others.BIGBATTLE.FREE) {
        const { GSID, COUNT } = bigFree;
        const _count = ctx.role.getProp(GSID);
        const key = bigChapterKey.shift();
        if (_count < COUNT) {
            bigbattle[key] = COUNT - _count;
        } else {
            bigbattle[key] = 0;
        }
    }


    // 观星
    const spin = {};
    const spinLevel = ['100', '300', '500', '800', '1000'];
    const spinExeid = (type, level) => `spinscore_${type}_${level}`;
    for (let i = 1; i < 3; i++) {
        for (const level of spinLevel) {
            const exeid = spinExeid(i, level);
            if (virtualExec(ctx.role, exeid, 1)) {
                spin[exeid] = 1;
            } else {
                spin[exeid] = 0;
            }
        }
    }
    const sevenlogin = [];
    for (let i = 0; i < 7; i++) {
        // 七天登录
        if (virtualExec(ctx.role, 'sevenlogin_' + i, 1)) {
            sevenlogin[i] = 1;
        } else {
            sevenlogin[i] = 0;
        }
    }

    // 征战
    const maplist = {
        achievement: 0, // 征战成就
        kz: 0, // 免费快战领取
        event: 0,
    }; //
    const _mapAchTag = role.getProp(93199);
    if (virtualExec(ctx.role, 'map_achievement_' + _mapAchTag)) {
        maplist.achievement = 1;
    }

    // 快战收益
    const kzTimes = ctx.role.getProp(90165);
    if (kzTimes < gameconfig.vip.KZ_LIMIT[ctx.role.vip]) {
        const kzcastitems = gameconfig.vip.KZ_CAST[kzTimes];
        if (!kzcastitems || kzcastitems.length === 0) {
            maplist.kz = 1;
        }
    }
    const _mapconfig_ = gameconfig.function_luck[EVENT_ENUM.WORLD_EVENT];
    if (_mapconfig_ && role.getProp(_mapconfig_.REQUIRE_NAME) >= role.getProp(_mapconfig_.REQUIRE_COUNT)) {
        let mapEvents = await ctx.dao.mapevent.find({ rid: ctx.role._id });

        if (mapEvents) {
            mapEvents = mapEvents.filter(m => {
                if (m.event.type === 3 || m.event.type === 4) {
                    let config = global.gameconfig['meventt' + m.event.type].deepQueryOne('ID', m.event.id);
                    if (!config) {
                        return false;
                    }
                    return _new >= m.create + config.MIN * 60 * 1000;
                }
                return true;
            });
            maplist.event = mapEvents.length;
        }
    }
    // 武门丰碑
    const monument = {};
    const rankMissionList = await ctx.dao.rankmission.find({ groupid: ctx.role._gameserv.groupid }, { type: 1, missionIndex: 1, roles: 1 });
    for (let m of rankMissionList) {
        const _config = global.gameconfig.rankmission[m.type][m.missionIndex];
        if (!_config) {
            continue;
        }
        if (!m.roles || m.roles.length === 0) continue; // 兼容角色被删了后roles为空的情况
        if (ctx.role.getProp(_config.MARK)) {
            continue;
        }
        monument[m.type] = monument[m.type] || 0;
        monument[m.type]++;
    }

    // 酒馆红点
    const recruit = {};
    const recruitFresh = global.gameconfig.others.RECRUIT.FREE_TYPE_HOUR;

    for (let type in recruitFresh) {
        const hour = (_new - ctx.role.recruitfree[type.toLowerCase()]) / (60 * 60 * 1000);
        if (hour >= recruitFresh[type]) {
            if (type === 'NORMAL') {
                recruit[1] = 1; // 普通
            } else {
                recruit[3] = 1;
            }
        }
    }
    try {
        role.castItemsNoSave(gameconfig.others.RECRUIT.CAST_ITEMS.RARE);
        role.cast_items = [];
        recruit[4] = 1; // 天运招募
    } catch (e) {
        // console.error(e);
    }

    // 悬赏令 红点
    const affair = { solo: 0, friend: 0, boss: 0 };
    const _affairs = await ctx.dao.affairs.findOne({ rid: owner });
    if (_affairs) {

        if (_affairs.missions) {
            for (let m of _affairs.missions) {
                if (_new >= m.etime) {
                    affair.solo = 1;
                    break;
                }
            }
        }
        if (_affairs.friendsMissions) {
            for (let m of _affairs.friendsMissions) {
                if (_new >= m.etime) {
                    affair.friend = 1;
                    break;
                }
            }
        }
    }
    // killed: 1, rid: {$in: rids}
    const fbossRids = [...ctx.role.friends, owner];
    // 增加索引条件
    affair.boss = await ctx.dao.fboss.countDocuments({ killed: 1, rid: { $in: fbossRids }, [`reward.${owner}`]: { $exists: true } });

    const legion = { apply: 0, lmission: 0, sign: 0, boss: 1, pvp: 0, lock: { factory: 1, secretplace: 1 } };
    let _legion;
    if (role.legion && (_legion = await ctx.dao.legion.findOne({ _id: role.legion }))) {
        legion.pvp = _legion.level >= global.gameconfig.legionpvp.REQUIRE.LEVEL ? 1 : 0;
        const legionPos = _legion._members.deepQueryOne('rid', owner).pos;
        if (legionPos > 0) { // 查询 申请列表
            legion.apply = await ctx.dao.apply.countDocuments({ type: 'legion', to: role.legion });
        }
        if (_legion.level >= global.gameconfig.others.LEGION.FACTORY_LVLIMIT) {
            legion.lock.factory = undefined;
            if (role.lmission) {
                const configMap = {};
                for (const c of global.gameconfig.legionmission) {
                    configMap[c.ID] = c;
                }
                legion.lmission = role.lmission.data.filter(m => m.stime && (m.stime + configMap[m.id].TIMEMIN * 60 * 1000) <= _new).length;
            }
        }
        if (_legion.secretplace > 0) {
            legion.lock.secretplace = undefined;
        }
        if (!ctx.role.getProp(90266)) {
            legion.sign = 1; // 军团祭祀
        }
        const lastLegionBoss = global.gameconfig.legionboss.length - 1;
        const lastBoss = await ctx.dao.lboss.findOne({ legion: _legion._id, index: lastLegionBoss }, { killed: 1 });
        if (lastBoss && lastBoss.killed) { // 最后一个 boss 被 杀掉，不推 boss红点
            legion.boss = 0;
        }
    }
    // 周活动 - 秘境宝阁、万众期待
    const zhd = { mjbg: 0, wzqd: 0 };
    zhd.mjbg = ctx.zhdpoint("MJBGRED", ctx.role);
    if (ctx.zhdpoint("ISZHD", "wzqd")) {
        let { WZQD: { MARK, BOXLIST: boxlist, MAXCOUNT: maxcount } } = global.gameconfig.zhd;
        let { total: nowcount = 0 } = (await ctx.commonsend('/activityinfo/total/get', {}).catch(console.warn)) || {};
        let check = boxlist.some((box, index) => {
            let record = ctx.role.wzqd || [];
            let one = record[index] || 0;
            // 1 => 已达成未领取 0 => 未达成
            let status = (nowcount / maxcount) * 100 >= box.PROB ? 1 : 0;
            if (one == 1) {
                status = 2;
            } // 已领取
            return status === 1;
        });
        if (ctx.role.getProp(MARK) === 0 || check) {
            zhd.wzqd = 1;
        }
    }

    const official = { srender: 0, general_official: 0, general_retinue: 0 }; // 府邸红点
    const record = await ctx.dao.prisoner.find({ rid: owner, state: 0 });
    official.srender = record.length;

    if (gameconfig.generalofficial) { // 武将官职（封赏系统
        const gOfficial = ctx.role.general_official || {};
        gOfficial.official = gOfficial.official || {};
        gOfficial.retinue = gOfficial.retinue || {};
        const checkNesPos = [];
        const checkRetinuePos = [];

        for (const pos in gameconfig.generalofficial.OFFICIAL) {
            if (gOfficial.official[pos]) { // 已经解锁的排除
                continue;
            }
            checkNesPos.push(pos);
        }

        for (const pos in gameconfig.generalofficial.RETINUE) {
            if (gOfficial.retinue[pos]) { // 已经解锁的排除
                continue;
            }
            checkRetinuePos.push(pos);
        }
        const checkRequire = (pos, type) => {
            const TYPE = type.toUpperCase();
            const c = gameconfig.generalofficial[TYPE][pos];
            if (!c) {
                return false;
            }
            for (let k in c.UNLOCK_REQUIRE) {
                if (ctx.role.getProp(k) < c.UNLOCK_REQUIRE[k]) { // 只要有一项不满足
                    return false;
                }
            }
            if (c.UNLOCK_CONSUME) {
                role.cast_items = [];
                try {
                    role.castItemsNoSave(c.UNLOCK_CONSUME);
                } catch (e) {
                    return false;
                }
            }
            return true;
        };
        for (const pos of checkNesPos) {
            if (checkRequire(pos, 'official')) { // 查出有一个可以解锁就显示红点
                official.general_official++;
                break;
            }
        }

        for (const pos of checkRetinuePos) {
            if (checkRequire(pos, 'retinue')) { // 查出有一个可以解锁就显示红点
                official.general_retinue++;
                break;
            }
        }
    }
    // 特殊提醒，借助 remind表来做记录
    let remind = await ctx.dao.remind.findOne({ rid: owner });
    if (!remind) {
        remind = await ctx.dao.remind.create({
            rid: owner,
            remind: {
                ydhd_ydhd: 1, // 月度活动的标记
            },
        });
    }
    const otherRemind = {};
    for (let k in remind.remind) {
        let [k0, k1] = k.split('_');
        otherRemind[k0] = otherRemind[k0] || {};
        otherRemind[k0][k1] = remind.remind[k] > 0 ? remind.remind[k] : 0;
    }
    // 查卧龙战令红点
    let waroder = await global.dao.warorder.findOne({ rid: ctx.role.i() })

    const act = {};
    if (global.gameconfig.zhd) {
        if (!role.getProp(90481) && role.getProp(30045) > 0) {
            // 龙帝召唤
            act.ldzh = 1;
        }
        // 探囊取物
        act.tnqw = await ctx.zhdpoint('TNQWRED', ctx.role, "tnqw");
        // 圣兽来袭
        act.sslx = await ctx.zhdpoint('TNQWRED', ctx.role, "sslx");
        let ldcfCount;
        // 龙帝赐福
        if ((ldcfCount = ctx.zhdpoint('LDCFREWARD', ctx.role)) > 0) {
            act.ldcf = ldcfCount;
        }
        // 神装合成
        act.szhc = ctx.zhdpoint('SZHCRED', ctx.role);
        // 招募祈愿
        if (ctx.zhdpoint('ZMQYRED', ctx.role)) {
            act.zmqy = 1;
        }
        // 周末福利
        if (ctx.zhdpoint('ZMFLRED', ctx.role)) {
            act.zmfl = 1;
        }
        // 限时兑换
        act.xsdh = ctx.zhdpoint('XSDHRED', ctx.role);
        // 限购礼包
        act.cjxg1 = ctx.zhdpoint('CJXG1RED', ctx.role);
        // 神兵降临
        act.sbjl = ctx.zhdpoint('SBJLRED', ctx.role);
        // 神秘宝箱
        // act.smbx = ctx.zhdpoint('SMBXRED', ctx.role);
        // 积分宝箱
        act.jfbx = ctx.zhdpoint('JFBXRED', ctx.role);
        // 活跃豪礼
        act.hyhl = ctx.zhdpoint('HYHLRED', ctx.role);
        act.hyhl1 = ctx.zhdpoint('HYHLRED', ctx.role, "hyhl1");
        // 周活动积天豪礼
        act.jthl = ctx.zhdpoint('JTHLRED', ctx.role, "zhd");
        // 常驻积天豪礼
        act.jthl1 = ctx.zhdpoint('JTHLRED', ctx.role, "forever");
        // 累计登录、登录豪礼
        ctx.zhdpoint('LJDLRED', ctx.role, act);
        // 定制礼包
        act.dzlb = ctx.zhdpoint('DZLBRED', ctx.role);
        // 周主题基金
        act.zztjj_gz = ctx.zhdpoint('ZZTJJ_RED', 'gz', ctx.role);
        act.zztjj_dj = ctx.zhdpoint('ZZTJJ_RED', 'dj', ctx.role);
        act.zztjj_gj = ctx.zhdpoint('ZZTJJ_RED', 'gj', ctx.role);
        act.zztjj_gx = ctx.zhdpoint('ZZTJJ_RED', 'gx', ctx.role);
        // 圣诞笔记
        act.sdbj = ctx.zhdpoint('SDBJ_RED', ctx.role);

        //欢乐砸金蛋
        act.zjd = ctx.zhdpoint('ZJD_RED', ctx.role);

        //迎春筹办
        act.yccb = ctx.zhdpoint('YCCB_RED', ctx.role);

        //招财聚宝
        act.xczc = ctx.zhdpoint('XCZC_RED', ctx.role);

        //元宵灯会
        act.yxdh = ctx.zhdpoint('YXDH_RED', ctx.role);

        // 英魂守护
        act.yhsh = ctx.zhdpoint("YHSHRED", ctx.role);
        act.yhsh1 = ctx.zhdpoint("YHSHRED", ctx.role, "yhsh1");
        ctx.zhdpoint("TJFXRED", ctx.role, act);
        // 活动道具红点,放入卧龙战令
        await ctx.zhdpoint("MARKRED", ctx.role, act, waroder);
        // 代言人皮肤活动
        act.smanskin = smsRed(ctx.role);
        // 预约送武将
        const { MARK, END } = global.gameconfig.general_appointment || {};
        if (_new < Date.parse(END) && ctx.role.getProp(MARK) == 0) act.gappointment = 1;
        // 新春任务红点
        let xcrw_dot = ctx.zhdpoint('XCRW_RED', ctx.role);
        if (xcrw_dot) act.xcrw = xcrw_dot.xcrw;
        // 百级关羽
        act.guanyu = await ctx.zhdpoint('GUANYU_REWARD', ctx.role);
        let sgzb_dot = await ctx.zhdpoint('SGZB', ctx.role);
        if (sgzb_dot) act.sgzb = sgzb_dot;

        // 元旦消费有礼
        let info = await global.dao.accumulgoodfixs.findOne({ rid: ctx.role.i(), hdtype: 'yd_xfyl' });
        let list = (info && await info.rewardstatus()) || [];
        list = list.filter(elem => elem && elem.status == 1);
        act.yd_xfyl = list.length;

        info = await global.dao.accumulgoodfixs.findOne({ rid: ctx.role.i(), hdtype: 'yd_xfyl2' });
        list = (info && await info.rewardstatus()) || [];
        list = list.filter(elem => elem && elem.status == 1);
        act.yd_xfyl2 = list.length;

        // 元旦好运福袋
        act.yd_hyfd = await ctx.zhdpoint('FUDAI_RED', ctx.role, 'yd_hyfd') || 0;
    }
    // 职业礼包
    if (_new < moment(ctx.role.create).startOf("day").add(7, "day").valueOf()) {
        let tutor = ctx.role.tutor || 1;
        let config = global.gameconfig.zylb[tutor - 1];
        let record = ctx.role.zylb || [];
        let dot = config.filter(({ LIMIT }, index) => LIMIT - (record[index] || 0) > 0).length;
        if (dot > 0) act.zylb = dot;
    }
    const groupid = ctx.role._gameserv.groupid;
    // 拍卖红点
    const auction = { legion_time: { start: 0, etime: 0, dismisstime: 0 }, north_time: { start: 0, etime: 0, dismisstime: 0 }, nation_time: { start: 0, etime: 0, dismisstime: 0 } };
    if (ctx.role.legion) {
        const auctionObj = await ctx.dao.auction.find({ auctioneer: `legion_${ctx.role.legion}`, groupid, expireAt: { $gt: _new - global.gameconfig.auction.LEGION.EXT_TIME * 1000 } }).sort({ expireAt: -1 }).limit(1);
        if (auctionObj[0]) {
            const a = auctionObj[0];
            auction.legion_time = {
                start: a.start,
                etime: a.expireAt,
                dismisstime: a.expireAt + global.gameconfig.auction.LEGION.EXT_TIME * 1000
            };
        }
    }

    const auctionNorthObj = await ctx.dao.auction.find({ auctioneer: 'north', groupid, expireAt: { $gt: _new - global.gameconfig.auction.NORTH.EXT_TIME * 1000 } }).sort({ expireAt: -1 }).limit(1);
    if (auctionNorthObj[0]) {
        const a = auctionNorthObj[0];
        // 拍卖提前10分钟展示,
        // 线上提前12小时展示
        if (_new - a.start > -12 * 60 * 60 * 1000) { // -12 * 60 * 60 * 1000
            auction.north_time = {
                start: a.start,
                etime: a.expireAt,
                dismisstime: a.expireAt + global.gameconfig.auction.NORTH.EXT_TIME * 1000
            };
        }

    }

    const auctionNationObj = await ctx.dao.auction.find({ auctioneer: 'nation', expireAt: { $gt: _new - global.gameconfig.auction.NORTH.EXT_TIME * 1000 } }).sort({ expireAt: -1 }).limit(1);
    if (auctionNationObj[0]) {
        const a = auctionNationObj[0];
        auction.nation_time = {
            start: a.start,
            etime: a.expireAt,
            dismisstime: a.expireAt + global.gameconfig.auction.NATION.EXT_TIME * 1000
        };
    }

    // 日礼包红点
    let daypack = function () {
        const dp = ctx.role.daypack || {};
        if (!dp.ispay) return 0;
        const record = dp.record || [];
        return global.gameconfig.daypack
            .filter(({ LIMIT }, i) => LIMIT - (record[i] || 0) > 0)
            .length - 1;
    }();
    // 超值基金
    const fund = await ctx.dao.c_worthfund.fetch(ctx.role);
    // 拍卖行礼包 - 功能未上暂时关闭
    //await global.dao.c_auctionpack.createPack(ctx.role)
    const auctionpack = [];//await global.dao.c_auctionpack.duration(ctx.role);
    // 新远征红点
    const nmaze = await global.dao.nmaze.findOne({ rid: ctx.role.i() });
    let maze = 0;
    if (nmaze) {
        const alyRewards = {};

        for (const star of (nmaze.starrewards || [])) {
            alyRewards[star] = 1;
        }
        for (const star of Object.keys(global.gameconfig.nmaze.STAR_BOX)) {
            if (!alyRewards[star] && nmaze.star >= + star) {
                maze++;
            }
        }
    }

    // 武将升星红点
    const generalstar = await global.dao.generalstar.duration(ctx.role._id, 'guanyu', { "93203": ctx.role.getProp(93203), "93312": ctx.role.getProp(93312) });
    let gstarRemind = 0;
    if (generalstar[0] && generalstar[1]) {
        if (_new >= +generalstar[0] && _new <= +generalstar[1]) gstarRemind = 1;
    }

    // 天机试炼红点
    const secrettrial = await global.dao.secrettrial.remind({ role: ctx.role });

    // 珍宝基金红点
    const zhenbao = await ctx.zhdpoint('ZHENBAO_FUND', ctx.role);

    // 阵法红点(解锁可升星)
    const zhenfa = await global.dao.zhenfa.getReddot(ctx.role);

    // 心愿招募
    let [ok] = ctx.role.isInPanda("XINYZM");
    const xyzm_info = { ljcz: 0, xyfl: 0, xylb: 0, xyzm: 0 };
    if (!ctx.role.panda.xyzm) {
        xyzm_info.xylb = 1, xyzm_info.xyzm = 1;
    }
    else if (ok) {
        let xyzm_config = global.gameconfig.xyzm;
        for (let i = 0; i < xyzm_config.XLBJ.length; i++) {
            let info = xyzm_config.XLBJ[i];
            if (info.REFRESHTYPE == "day" && info.PRICE == 0) {
                if (!ctx.role.panda.xyzm.xlbjrecord[i]) {
                    xyzm_info.xylb = 1;
                }
                break;
            }
        }

        for (let i = 0; i < xyzm_config.XYZM.COST.length; i++) {
            let info = xyzm_config.XYZM.COST[i];
            if (info.FREE_CD > 0) {
                if (ctx.role.panda.xyzm.freetime == 0) {
                    xyzm_info.xyzm = 1;
                }
                else if (ctx.role.panda.xyzm.freetime + info.FREE_CD * 3600 * 1000 < _new) {
                    xyzm_info.xyzm = 1;
                }
                break;
            }
        }

        for (let i = 0; i < xyzm_config.LJCZ.ITEMS.length; i++) {
            let info = xyzm_config.LJCZ.ITEMS[i];
            if (ctx.role.panda.xyzm.ljczmoney >= info.MONEY && !ctx.role.panda.xyzm.ljczrecord[i]) {
                xyzm_info.ljcz = 1;
                break;
            }
        }
        // [ok, season] = ctx.role.isInPanda("XYFL");
        // if (ctx.role.panda.xyzm.xyflseason == season) {
        //     let xyfl_config = global.gameconfig.xyfl;
        //     for (let i = 0; i < xyfl_config.ITEMS.length; i++) {
        //         let info = xyfl_config.ITEMS[i];
        //         if (ctx.role.panda.xyzm.val >= info.CNUM && !ctx.role.panda.xyzm.xyflrecord[i]) {
        //             xyzm_info.xyfl = 1;
        //             break;
        //         }
        //     }
        // }
    }

    let [smok] = ctx.role.isInPanda("SMZM");
    const smzm_info = { ljcz: 0, smfl: 0, smlb: 0, smzm: 0 };
    if (smok) {
        if (!ctx.role.panda.smzm) {
            smzm_info.smlb = 1, smzm_info.smzm = 1;
        }
        else {
            let smzm_config = global.gameconfig.smzm;
            for (let i = 0; i < smzm_config.XLBJ.length; i++) {
                let info = smzm_config.XLBJ[i];
                if (info.REFRESHTYPE == "day" && info.PRICE == 0) {
                    if (!ctx.role.panda.smzm.xlbjrecord[i]) {
                        smzm_info.smlb = 1;
                    }
                    break;
                }
            }

            for (let i = 0; i < smzm_config.SMZM.COST.length; i++) {
                let info = smzm_config.SMZM.COST[i];
                if (info.FREE_CD > 0) {
                    if (ctx.role.panda.smzm.freetime == 0) {
                        smzm_info.smzm = 1;
                    }
                    else if (ctx.role.panda.smzm.freetime + info.FREE_CD * 3600 * 1000 < _new) {
                        smzm_info.smzm = 1;
                    }
                    break;
                }
            }

            for (let i = 0; i < smzm_config.LJCZ.ITEMS.length; i++) {
                let info = smzm_config.LJCZ.ITEMS[i];
                if (ctx.role.panda.smzm.ljczmoney >= info.MONEY && !ctx.role.panda.smzm.ljczrecord[i]) {
                    smzm_info.ljcz = 1;
                    break;
                }
            }

            let [ok, season] = ctx.role.isInPanda("SMFL");
            if (ok) {
                let smfl = global.gameconfig.smfl[season].ITEMS;
                for (let i = 0; i < smfl.length; i++) {
                    let info = smfl[i];
                    if (ctx.role.panda.smzm.val >= info.CNUM && !ctx.role.panda.smzm.smflrecord[i]) {
                        smzm_info.smfl = 1;
                        break;
                    }
                }
            }
        }
    }

    let [dlslok, dlslseason, dlslid] = ctx.role.isInPanda("DLSL");
    let dlsl_info = { dlsl: 0 };
    if (dlslok) {
        if (!ctx.role.panda.dlsl) dlsl_info.dlsl = 1;
        else {
            let config = global.gameconfig["panda_dlsl" + dlslid];
            if (config) {
                for (let key in config.server) {
                    for (let rule of config.server[key]) {
                        if (rule.REQUIRE) {
                            for (let req of rule.REQUIRE) {
                                let flags = [];
                                const count = ctx.role.getProp(req.GSID);
                                if (typeof req.COUNT === 'number') flags.push(count == req.COUNT);
                                if (typeof req.MINCOUNT === 'number') flags.push(count >= req.MINCOUNT);
                                if (typeof req.MAXCOUNT === 'number') flags.push(count <= req.MAXCOUNT);
                                if (Array.isArray(req.IN)) flags.push(req.IN.includes(count)); // 增加一个包含条件
                                if (typeof req.POS === 'number') flags.push((0x00000001 & (count >> (req.POS - 1))) !== 1);

                                dlsl_info.dlsl = flags.every(f => f) ? 1 : 0;
                                if (!dlsl_info.dlsl) break;
                            }
                        }
                        if (dlsl_info.dlsl) break;
                    }
                    if (dlsl_info.dlsl) break;
                }
            }
        }
    }

    let [pfxpok, pfxpseason, pfxpid] = ctx.role.isInPanda("PFXP");
    let pfxp_info = { pfxp: 0, free: 0 };
    if (pfxpok) {
        if (!ctx.role.panda.pfxp) {
            pfxp_info.pfxp = 1;
            pfxp_info.free = 1;
        }
        else {
            let config = global.gameconfig[`pfxppool${pfxpid}`];
            if (config) {
                for (let i = 0; i < config.REWARD.length; i++) {
                    let reward = config.REWARD[i];
                    if (ctx.role.panda.pfxp.score >= reward.SCORE && !ctx.role.panda.pfxp.get[i]) {
                        pfxp_info.pfxp = 1;
                        break;
                    }
                }
            }
            let free = _new - ctx.role.panda.pfxp.free;
            if (free >= config.FREE * 3600 * 1000) pfxp_info.free = 1;
        }
    }

    let xfqd = { xsqg: 0 };
    if (global.gameconfig.xsqg) {
        let record = ctx.role.xsqg || [];
        let buy = global.gameconfig.xsqg.findIndex((value, index) => {
            let bought = record[index] || 0;
            return value.PRICE == 0 && bought < value.LIMIT;
        });
        xfqd.xsqg = buy > -1 ? 1 : 0;
    }

    // 新服挑战
    let xftz = 0;
    let [xftz_ok, xftz_season] = ctx.role.isInPanda("XFTZ");
    if (xftz_ok) {
        let infos = await ctx.dao.c_xftz.find({ season: xftz_season, servid: ctx.role.servid });
        for (let info of infos) {
            if (!ctx.role.panda.xftz || !ctx.role.panda.xftz.first[info.floor]) {
                xftz = 1;
                break;
            }
        }
    }

    // 传说挑战
    let cstz = 0;
    let [cstz_ok, cstz_season, cstz_id] = ctx.role.isInPanda("CSTZ");
    if (cstz_ok) {
        let info = await ctx.dao.legend.findOne({ season: cstz_season, servid: ctx.role.servid });
        if (info) {
            let CONFIG = global.gameconfig["legend" + cstz_id];
            for (let key in CONFIG.REWARD) {
                if (key <= info.damage && (!ctx.role.panda.cstz || !ctx.role.panda.cstz.flag[key])) {
                    cstz = 1;
                    break;
                }
            }
        }
    }

    let destiny = { reward: 0, first: 0, unlock: 0, set: 0 };
    if (global.gameconfig.deftiny) {
        let config = global.gameconfig.deftiny;
        destiny.reward = ctx.role.getProp(config.COST.REWARDGSID) ? 0 : 1;
        destiny.first = ctx.role.getProp(config.COST.FIRSTGSID) ? 0 : 1;
        const tian = ctx.role.destiny;
        config.COST.SLOT.forEach((value, index) => {
            let general = tian.general[index];
            if (!general && ctx.role.level >= value.LEVEL) {
                destiny.unlock = 1;
            }
            else if (general && !general.guid) {
                destiny.set = 1;
            }
        })
    }

    act.mrthyj = 0;
    for (let i = 0; i < global.gameconfig.mrthyj.ITEMS.length; i++) {
        let value = global.gameconfig.mrthyj.ITEMS[i];
        if (value.PRICE == 0) {
            let bought = ctx.role.mrthyj[i] || 0;
            act.mrthyj = value.LIMIT > bought ? 1 : 0;
            break;
        }
    }

    let shop_cache = await ctx.dao.c_shop.findOne({ rid: ctx.role._id, type: "day" });
    let shop = { freeupgrade: 0 };
    if (shop_cache) {
        for (let value of shop_cache.goods) {
            if (value.PRICE == 0 && value.BUYTIME > 0) {
                shop.freeupgrade = 1;
                break;
            }
        }
        if (!shop.freeupgrade) {
            const config = global.gameconfig.shop_refresh["day"];
            if (config && config.INTERAL) {
                const _last = new Date(shop_cache.refresh);
                _last.setHours(0, 0, 0, 0);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const del = (+now) - _last;
                if (del >= config.INTERAL * 60 * 60 * 1000) {
                    shop.freeupgrade = 1;
                }
            }
        }
    }
    else {
        shop.freeupgrade = 1;
    }

    //==============================================================================限时战役红点
    let xszy = { undoneCount: 0, liang: 0, task: 0 };
    const eventlist = global.gameconfig.chapter_new_event.EVENT_LIST.map(task => {
        return {
            index: task.ID,
            status: -1, // -1标示未触发
            exchange: {},
            taskscore: {},
            liang: {},
            subindex: 0,
            totaldamge: 0
        }
    })
    const touchlist = await ctx.dao.timeplay.find({ rid: ctx.role._id });
    const touchMap = {};
    for (const t of touchlist) {
        t.status = 0;
        touchMap[t.index] = t;
    }
    for (let i = 0; i < eventlist.length; i++) {
        eventlist[i] = touchMap[eventlist[i].index] || eventlist[i];
    }
    for (let i = eventlist.length - 1; i >= 0; i--) {
        if (xszy.liang && xszy.undoneCount && xszy.task) { break; }
        const one = eventlist[i];
        if (one.status == -1) { continue; }
        one.task = one.task || {};
        if (!xszy.task) {
            let taskConfig = global.gameconfig.chapter_new_event.TASK[one.index];
            if (taskConfig) {
                const etime = (one.task_time && one.task_time.etime) || 0;
                for (let t of taskConfig) {
                    if (etime > _new && !one.task[t.ID]) { // 有未完成的 标记++, 且活动未结束
                        //if (await one.taskProcess(t.ID, ctx.role)) {
                        xszy.task++;//2023/4/12徐子其要求有任务就计算
                        break;
                        //}
                    }
                }
            }
        }
        if (!xszy.task) {
            const t_score = global.gameconfig.chapter_new_event.TASK_SCORE[one.index];
            if (t_score) {
                const etime = (one.task_time && one.task_time.etime) || 0;
                for (const t of t_score) {
                    if (etime > _new && !one.taskscore[t.ID]) {
                        const finishLength = Object.values(one.task).filter(Boolean).length;
                        if (finishLength >= t.NUM) {
                            xszy.task++;
                            break;
                        }
                    }
                }
            }
        }
        if (!xszy.liang) {
            const lcfg = global.gameconfig.chapter_new_event.LIANG[one.index];
            if (lcfg) {
                const startDate = new Date(one.create);
                startDate.setHours(0, 0, 0, 0);
                for (const l of lcfg) {
                    if (!one.liang[l.ID]) {
                        let etime = startDate.getTime() + (l.DAY - 1) * 24 * 3600 * 1000;
                        if (etime < _new) {
                            etime = global.gameconfig.chapter_new_event.LIANG_DEF_TIME + one.create;
                            if (etime <= _new) {
                                xszy.liang++;
                            }
                        }
                        break;
                    }
                }
            }
        }
        if (!xszy.undoneCount) {
            const bid = global.gameconfig.chapter_new_event.BOSS[one.index];
            const boss = global.gameconfig.boss_time_limit[bid];
            if (bid) {
                const lastBossIndex = boss.length - 1;
                if (one.subindex < lastBossIndex) {
                    xszy.undoneCount++;
                } else if (one.subindex === lastBossIndex && one.totaldamge < boss[lastBossIndex].BOSSHP) {
                    xszy.undoneCount++;
                }
            }
        }
    }
    //==============================================================================

    let qxzl_info = { 1: 0, 2: 0 };
    let weekday = moment().weekday();
    let hour = moment().hours();
    let createTime = moment(ctx.role.create).startOf('days').valueOf();
    let serverTime = moment(ctx.role._gameserv.start).startOf('days').valueOf();

    let typeArr = [];
    for (let type = 1; type <= 2; type++) {
        let qxzltTime = type == 1 ? global.gameconfig.qxzlonecopy.TIME[weekday] : global.gameconfig.qxzlgroupcopy.TIME[weekday];
        let startTime = qxzltTime.TYPE == 0 ? createTime : serverTime;
        let endTime = startTime + (parseInt(qxzltTime.TYPEDAY) - 1) * 24 * 3600 * 1000;
        if (qxzltTime.OPEN && hour >= qxzltTime.START && hour < qxzltTime.END && _new >= endTime && ctx.role.level >= qxzltTime.LEVEL) {
            qxzl_info[type] = 1;
            typeArr.push(type)
        }
    }

    let qxzl = await ctx.dao.c_qxzl.find({ rid: ctx.role.i(), type: { $in: typeArr } }, { type: 1, val: 1 }).limit(typeArr.length);
    qxzl.forEach(({ type, val }) => {
        qxzl_info[type] = val;
    })

    let hsgc = { hsgc: 0, shop: 0 }, key = 'hsgc';
    let [hsgcok, season, id] = ctx.role.isInPanda(key);
    if (hsgcok) {
        let cache = ctx.role.panda[key];
        let config = global.gameconfig[key];
        if (config) {
            let mongoFind = await ctx.dao.hsgc.findOne({ servid: ctx.role.servid }, { stage: 1, score: 1 });
            if (mongoFind) {
                let stageReward = config.stageReward;
                let canget = !cache || cache.id != id;
                hsgc.shop = canget || cache.stage != mongoFind.stage ? 1 : 0;
                for (let stage in stageReward) {
                    let info = stageReward[stage];
                    if (info.SCORE > 0 && mongoFind.stage >= stage && mongoFind.score >= info.SCORE && (canget || !cache.flag[stage])) {
                        hsgc.hsgc = 1;
                        break;
                    }
                }
            }
        }
    }

    let bless = { 1006: 0, 1007: 0, "manor": 0, "legion": 0, list: 0 };
    {
        let config = global.gameconfig.bless;
        if (config) {
            let obj = { 1006: "manor", 1007: "legion" };
            for (let value of [1006, 1007]) {
                let cfg = config.BOX.find(box => box.DROPID == value);
                let type = obj[value];
                if (ctx.role.bless[type] > 0) {
                    bless[type] = 1;
                    if (cfg?.TIME * 60000 <= _new - ctx.role.bless[type]) {
                        bless[value] = 1;
                    }
                }
            }
        }
        if (ctx.role.legion) {
            let cfg = config.BOX.find(box => box.DROPID == 1007);
            let time = _new - cfg.TIME * 60000;
            let res = await global.dao.role.findOne({
                _id: { $ne: ctx.role.id }, legion: ctx.role.legion, "bless.speed": 1, "bless.legion": { $gt: time }, "bless.help": { $nin: [ctx.role.i()] },
                $or: [{ "others.99065": { $exists: false } }, { "others.99065.count": { $lt: cfg.HELP.COUNT } }]
            }, { bless: 1 });
            if (res) {
                bless.list = 1;
            }
        }
    }

    let cjzm = await cjzmhd(ctx)

    let weektarget = welDot(ctx.role);
    res = {
        bless,
        hsgc,
        qxzl_info,
        cstz,
        xszy,
        shop,
        destiny,
        xftz,
        xfqd,
        pfxp_info,
        dlsl_info,
        xyzm_info,
        smzm_info,
        mail,
        friend,
        jchd: jchdCanRecCount,
        xby,
        bigbattle,
        spin,
        sevenlogin,
        maplist,
        monument,
        recruit,
        affair,
        legion,
        zhd,
        act,
        official,
        auction,
        aution: auction,
        weektarget,
        weektargettwo: weektarget,
        daypack,
        auctionpack,
        worthfund: fund ? fund.hasNotBought() : 1,
        maze,
        generalstar: gstarRemind,
        secrettrial,
        zhenbao,
        zhenfa,
        cjzm,
        ...otherRemind,
    };
    //缓存6s
    global.services.RemindService.set("remind:" + ctx.role._id, res, 6);
    ctx.body = res
};




async function cjzmhd(ctx) {
    try {
        await ctx.role.cjzminsyhinfo(ctx)
        //连购礼包
        let list = ['mb', 'yl', 'jjd', 'sp']
        let data = {
            lglb: 0,
            txz: 0,
            cjrw: 0,

        }
        //连购礼包红点
        list.map(e => {
            let config = ctx.role.cjzmsyh['lglb']['reward'][e]
            let lglb = ctx.role.cjzmsyh['lglb']
            if (e != 'sp') {
                let index = Number(config.index) + 1
                let userconfig = config[index]
                if (userconfig && !userconfig.use && userconfig.price == 0) {
                    data.lglb = 1
                }
            } else {
                for (let x in config) {
                    if (!config[x].use && lglb.spcount >= config[x].cnum) {
                        data.lglb = 1
                        break;
                    }

                }
            }

        })

        function txzSystem(ctx, data) {
            let time = Date.now()
            let key = 'cjzmtxz'
            let isvip = false
            if (ctx.role.special[key] && time < ctx.role.special[key]) {
                isvip = true
            }
            let day = ctx.role.cjzmsyh['txz']['day']
            for (let index = 1; index <= global.gameconfig.cjzmsyh[2].length; index++) {
                //免费领取
                if (ctx.role.cjzmsyh['txz']['reward'][index]['free'] == 0 && day >= index) {
                    data.txz = 1
                    break;
                }
                //vip领取
                if (ctx.role.cjzmsyh['txz']['reward'][index]['vip'] == 0 && day >= index && isvip) {
                    data.txz = 1
                    break;
                }
            }
        }
        //通行证红点
        txzSystem(ctx, data)
        //超级任务红点
        for (let index in ctx.role.cjzmsyh['lucky']['reward']) {
            let itemid = 38025
            let config = ctx.role.cjzmsyh['lucky']['reward'][index]
            if (config && config.mark[0].count >= 1 && ctx.role.getItems(itemid).count >= Number(index)) {
                data.cjrw = 1
            }
        }
        console.log("红点情况", data)
        return data
    } catch (error) {
        console.error('红点', error)
        let data = {
            lglb: 0,
            txz: 0,
            cjrw: 0,

        }
        return data
    }
}