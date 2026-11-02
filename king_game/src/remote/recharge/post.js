'use strict'

const actions = require('./right_actions');
const houseLampNotify = require('../../hook/houseLampNotify');
const callback = require('./callback');
const moment = require('moment');
const { match } = require('assert');

module.exports = exports = async function (ctx, next) {
    const is_xs = ctx.request.body.pid.startsWith('xs_'); // 是否新手
    if (is_xs) ctx.request.body.pid = ctx.request.body.pid.replace('xs_', ''); // 去掉前缀方便后面逻辑复用
    const {
        pid,
        rid,
        orderid,
        lang,
        amount = 0,
        _virtual // 是否是模拟充值，模拟充值不发放累计充值的标记，方便统计区分真实付费用户
    } = ctx.request.body;

    ctx.assert(ctx.role, 'invalid rid');
    const OLD_VIP = ctx.role.vip;
    ctx.role._path_ = 'recharge/confirm#pid=' + ctx.request.body.pid;
    let out = [], price = 0, exp_byconfig = false;
    let is_first = false;
    if (ctx.role.getItems(38003).count <= 0) is_first = true;
    const tp = pid.split('_')[0];
    if (callback[tp]) {
        [out, price, exp_byconfig] = await callback[tp](ctx.role, pid);
    }
    else if (pid.startsWith('actsppack')) { // 限时活动超值礼包 @author awko
        const [_, actType, sppackid] = pid.split('_');
        const act = ACTIVITY[actType.toLowerCase()];
        if (!act || !act.params.sppack || !act.params.sppack[sppackid]) {
            console.log('ACTSPPACK BUY ERROR,', ctx.role.rno, actType, sppackid);
            ctx.assert(false, 'invalid act sppack');
        }
        const astSppack = act.params.sppack[sppackid];
        price = astSppack.price;
        out = astSppack.items;
        if (astSppack.consume && astSppack.consume.length > 0) {
            ctx.role.castItemsNoSave(astSppack.consume); // 如果存在购买消耗品,例如 购买消耗标记之类的操作
        }
        // 加经验
        if (astSppack.exp) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: astSppack.exp });
        }
        ctx.role.act[actType] = ctx.role.act[actType] || {};
        const times = ctx.role.act[actType][sppackid] ? (ctx.role.act[actType][sppackid].times || 0) : 0; // 历史购买次数
        ctx.role.act[actType][sppackid] = { times: times + 1 }; // 购买次数+1;
        ctx.role.markModified(`act.${actType}.${sppackid}`);
    } else if (pid.startsWith('recompgift')) { // 推荐礼包 @author awko
        const [_, gift_type, index] = pid.split('_');
        if (ctx.is_batch(gift_type)) { // BATCH开头的推荐礼包为多档次同时触发的推荐礼包类型
            let gift = await ctx.dao.c_recommp_gift_batch.find({ rid: ctx.role._id, type: gift_type, isBuy: 0 }).sort({ _id: -1 }).limit(1);
            gift = gift[0];
            if (!gift || gift.isBuy !== 0) {
                console.log('RECOMPGIFT BUY ERROR', ctx.role.rno, gift_type)
            }
            ctx.assert(gift, 'no gift');
            const sppackItem = gift.sppack[+index];
            ctx.assert(sppackItem, 'gift item error');
            sppackItem.buyTime = Date.now();
            sppackItem.count--; // 子项可购买次数-1
            price = sppackItem.price;
            out = sppackItem.rewards;
            if (sppackItem.exp) {
                exp_byconfig = true;
                ctx.role.addItemsNoSave({ gsid: 38003, count: sppackItem.exp });
            }
            const buyCount = gift.sppack.filter(s => s.count > 0).length;
            if (buyCount === 0) { // 没有子项可以购买了
                gift.isBuy = 1; // 整个礼包项标记已被购买
            }
            gift.markModified('sppack');
            await gift.save();

        } else {
            let gift = await ctx.dao.c_recommp_gift.find({ rid: ctx.role._id, type: gift_type, isBuy: 0 }).sort({ _id: -1 }).limit(1);
            if (Array.isArray(gift)) gift = gift[0];
            if (!gift || gift.isBuy !== 0) {
                console.log('RECOMPGIFT BUY ERROR', ctx.role.rno, gift_type)
            }
            ctx.assert(gift, 'no gift');
            ctx.assert(gift.isBuy === 0, 'gift bought');
            price = gift.price;
            out = gift.rewards;
            gift.isBuy = 1;
            gift.buyTime = Date.now();
            await gift.save();
            if (gift.exp) {
                exp_byconfig = true;
                ctx.role.addItemsNoSave({ gsid: 38003, count: gift.exp });
            }
        }

    } else if (pid.startsWith('spp')) {
        const [_, cycle, index] = pid.split('_');
        if (cycle == "dayly") {
            let config = global.gameconfig['sppack' + cycle][index];
            price = config.PRICE;
            out.append(config.ITEMS);
            ctx.role.daygift = ctx.role.daygift || [];
            let bought = ctx.role.daygift[index] || 0;
            ctx.role.daygift[index] = ++bought;
            if (config.VIPEXP) {
                exp_byconfig = true;
                ctx.role.addItemsNoSave({ gsid: 38003, count: config.VIPEXP });
            }
            ctx.role.markModified("daygift");
        }
        else {
            let cache = await ctx.dao.c_sppack.findOne({ rid: ctx.role._id, type: cycle.toLowerCase() });
            ctx.assert(cache, 'no cache');
            const good = cache.items[index];
            price = good.price;
            ctx.assert(good, 'invalid index');
            const buytime = good.buytime;
            ctx.assert(buytime > 0, 'no more');
            cache.items[index].buytime--;
            cache.markModified(['items', index, 'buytime'].join('.'));
            await cache.save();
            out.append(good.items);
            let config = global.gameconfig['sppack' + cycle][0][index]
            if (config.EXP || good.exp) {
                exp_byconfig = true;
                ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP || good.exp });
            }
        }
    } else if (pid.startsWith('sspp')) {
        const [_, _type, index] = pid.split('_');
        const type = _type.toLowerCase();
        const config = global.gameconfig['ssppack' + type][index];
        ctx.assert(config, 'invalid index');
        const cache = ctx.role.ssppack[type][index];
        ctx.assert(cache.bt >= 1, 'no more');
        ctx.role.ssppack[type][index].bt--;
        ctx.role.markModified(['ssppack', type, index, 'bt'].join('.'));
        out.append(config.ITEMS);
        price = config.PRICE;
        if (config.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        }
    } else if (pid.startsWith('czlb') || pid.startsWith('jrlb2') || pid.startsWith('gxlb')
        || pid.startsWith("zylb") || pid.startsWith("dbsd") || pid.startsWith("pflb") || pid.startsWith('bjsr')
        || pid.startsWith('gjlb') || pid.startsWith('gzlb') || pid.startsWith('thlb')
        || pid.startsWith("swlb1") || pid.startsWith("jhlb1") || pid.startsWith('xljxlb')
        || pid.startsWith('sglb')
        || pid.startsWith('sglb1')
        || pid.startsWith('sglb2')
        || pid.startsWith('hdlb')
        || pid.startsWith('cplb')
        || pid.startsWith('cplb2')
        || pid.startsWith('cclb')
        || pid.startsWith('dwlb') || pid.startsWith('jhlb') || pid.startsWith('swlb')) {
        /**
         * 此处兼容多下划线的pid,例如
         * zztjj_gz_0
         */
        let _tmp = pid.split('_');
        let index = _tmp.pop();
        let _prefix = _tmp.join('_');
        index = parseInt(index);
        let prefix;
        prefix = is_xs ? 'xs_' + _prefix : _prefix; // 拼接回去xs_前缀，方便读取对应配置xs_*配置
        let config;
        if (prefix == "zylb") {
            config = global.gameconfig.zylb[(ctx.role.tutor || 1) - 1]
        }
        else if (prefix.startsWith("swlb") || prefix.startsWith("jhlb") || pid.startsWith('xljxlb')) {
            config = global.gameconfig.zhd_newhero[prefix.toUpperCase()];
        }
        else {
            config = global.gameconfig.zhd[prefix.toUpperCase()];
        }
        if (!config) throw new Error('miss zhd config:' + prefix);
        config = config[index];
        ctx.assert(config, 'invalid index');
        price = config.PRICE;
        if (is_xs) {
            for (let i = 0; i < 3; ++i) { // 新手期最大156周，3位数
                _prefix = _prefix.substring(0, _prefix.length - 1);
                if (ctx.role[_prefix]) break;
            }
        }
        let bought = ctx.role[_prefix][index] || 0;
        ctx.assert(bought < config.LIMIT, 'no more');
        ctx.role[_prefix][index] = ++bought;
        ctx.role.markModified(_prefix);
        ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        exp_byconfig = true;
        // 判断礼包是否有特殊标记-积分宝箱使用
        if (config.SPECIAL && config.SPECIAL.length > 0) {
            ctx.zhdpoint("JFBX", ctx.role, config.SPECIAL[0].COUNT, config.SPECIAL[0].GSID);
        }
        out = [...out, ...config.ITEMS];
    } else if (pid.startsWith('zztjj') || pid.startsWith('zztjj1')) {
        // 周主题基金(周活动签到)
        let [, type] = pid.split('_');
        let prefix;
        let pid1 = `zztjj_${type}`;
        prefix = is_xs ? 'xs_' + pid1 : pid1; // 拼接回去xs_前缀，方便读取对应配置xs_*配置
        let config = global.gameconfig.zhd[prefix.toUpperCase()];
        ctx.assert(config, "invalid config");
        if (is_xs) pid = pid.substring(0, pid.length - 1);
        let record = ctx.role[pid] || {};
        ctx.assert((record.ispay || 0) == 0, "already buy");
        record.ispay = 1;
        ctx.role[pid] = record;
        ctx.role.markModified(pid);
        price = config.PRICE;
        if (config.EXP) {
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
            exp_byconfig = true;
        }
        ctx.zhdpoint('ZZTJJ_POINT', type, ctx.role);
    } else if (pid.startsWith('occ')) {
        // 职业任务礼包
        let [, id] = pid.split('_');
        id = parseInt(id);
        let packs = global.gameconfig.occtask.GIFT_PACKS[ctx.role.occtask.occtype].PACKS;
        let packInfo = packs.find(pack => {
            return pack.ID == id;
        })
        ctx.assert(packInfo, 'invalid id');
        price = packInfo.VALUE;
        //保存玩家职业礼包信息
        ctx.role.occtask.giftpacks.id = id;
        ctx.role.occtask.giftpacks.time = Date.now();
        ctx.role.occtaskend = -1; // 设为-1,关闭窗口
        ctx.role.markModified('occtask');
        ctx.role.markModified('occtaskend');
        out = [...out, ...packInfo.ITEMS];
        if (packInfo.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: packInfo.EXP });
        }
    } else if (pid.startsWith('rewardcup')) {
        // 委托令系列
        exp_byconfig = true;
        let [, name] = pid.split('_');
        let config = global.gameconfig.rewardcup[name];
        ctx.assert(config, 'invalid config');
        price = config.PRICE
        ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        if (name == 'sjg') {
            ctx.role.addItemsNoSave({ gsid: 93366, count: 1 });
        } else if (name == 'maze') {
            ctx.role.addItemsNoSave({ gsid: 94100, count: 1 });
            // 重置免费使用七星灯的次数
            let qixingLight = ctx.role.getProp(90529);
            if (qixingLight != 0) ctx.role.castItemsNoSave({ gsid: 90529, count: qixingLight });
        }
        // 保存记录
        ctx.role.rewardcup[name] = Date.now();
        ctx.role.markModified('rewardcup.' + name);
    } else if (pid.startsWith('cjxg2') || pid.startsWith('cjxg3')) {
        let [prefix, index, myselect] = pid.split('_');
        index = parseInt(index);
        myselect = parseInt(myselect);
        let key = is_xs ? 'xs_' + prefix : prefix;
        let config = global.gameconfig.zhd[key.toUpperCase()];
        if (!config) throw new Error('miss zhd config:' + key);
        config = config[index];
        ctx.assert(config, 'invalid index');
        price = config.PRICE;
        if (is_xs) prefix = prefix.substring(0, prefix.length - 1);
        let bought = ctx.role[prefix][index] || 0;
        ctx.assert(bought < config.LIMIT, 'no more');
        ctx.role[prefix][index] = ++bought;
        ctx.role.markModified(prefix);
        ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        exp_byconfig = true;
        out = [...out, ...config.ITEMS];
        if (config.SELECTITEMS && config.SELECTITEMS[myselect]) {
            out.push(config.SELECTITEMS[myselect])
        }
    } else if (pid.startsWith('overlord')) {
        let [prefix, index] = pid.split('_');
        index = parseInt(index);
        let config = global.gameconfig.overlord[index];
        ctx.assert(config, 'invalid index');
        price = config.PRICE;
        let bought = ctx.role[prefix][index] || 0;
        ctx.assert(bought < config.LIMIT, 'no more');
        ctx.role[prefix][index] = ++bought;
        ctx.role.markModified(prefix);
        ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        exp_byconfig = true;
        out = [...out, ...config.ITEMS];
    } else if (pid.startsWith('daypack')) {
        let [_, index] = pid.split('_');
        index = parseInt(index);
        let config = global.gameconfig.daypack[index];
        ctx.assert(config, 'invalid index');
        price = config.PRICE;
        let daypack = ctx.role.daypack || {};
        daypack.record = daypack.record || [];
        let bought = daypack.record[index] || 0;
        ctx.assert(bought < config.LIMIT, 'no more');
        const confLen = global.gameconfig.daypack.length;
        if (index == confLen - 1) {
            // 一键购买多天后，所有礼包都要置为可领取
            daypack.record = Array.from({ length: confLen }).fill(0);
            daypack.day = 7;
            daypack.ispay = 1;
        } else {
            daypack.record[index] = ++bought;
        }
        ctx.role.daypack = daypack;
        ctx.role.markModified("daypack.day");
        ctx.role.markModified("daypack.ispay");
        ctx.role.markModified("daypack.record");
        ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        exp_byconfig = true;
        out = [...out, ...config.ITEMS];
    } else if (pid.startsWith("weektarget") || pid.startsWith("twoweektarget")) { // 七日目标充值礼包
        let [prefix, index] = pid.split('_');
        index = parseInt(index);
        let config = global.gameconfig[prefix].GIFTPACK[index];
        ctx.assert(config, "invalid index");
        price = config.PRICE;
        let bought = ctx.role[prefix].gift[index] || 0;
        ctx.assert(bought < config.LIMIT, "no more");
        ctx.role[prefix].gift[index] = ++bought;
        ctx.role.markModified(`${prefix}.gift`);
        out = [...out, ...config.REWARD, ...config.SPECLIST];
        if (config.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        }
    } else if (pid.startsWith("sevenlogin") || pid.startsWith("fourteenlogin")) { // 七日登录、14日签到礼包
        let [prefix, index] = pid.split('_');
        index = parseInt(index);
        let config = global.gameconfig[prefix][index];
        ctx.assert(config, "invalid index");
        price = config.PRICE;
        let bought = ctx.role[prefix][index] || 0;
        ctx.assert(bought < config.LIMIT, "no more");
        ctx.role[prefix][index] = ++bought;
        ctx.role.markModified(`${prefix}`);
        out = [...out, ...config.ITEMS];
        if (config.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        }
    } else if (pid.startsWith("worthfund")) {
        let [, index] = pid.split("_");
        index = Number.parseInt(index);
        const { FUND, PRICE } = global.gameconfig.worthfund;
        if (index < FUND.length) {
            let config = FUND[index];
            ctx.assert(config, "invalid index");
            price = config.PRICE;
            let record = await global.dao.c_worthfund.findOne({ rid: ctx.role.i() });
            ctx.assert(!record.bought(price), "alreadly buy");
            out = await record.buy(ctx.role, price);
            if (config.EXP) {
                ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
                exp_byconfig = true;
            }
        }
        else if (amount == PRICE) {
            price = PRICE;
            for (let config of FUND) {
                let price1 = config.PRICE;
                let record = await global.dao.c_worthfund.findOne({ rid: ctx.role.i() });
                ctx.assert(!record.bought(price1), "alreadly buy");
                out = await record.buy(ctx.role, price1);
                if (config.EXP) {
                    ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
                    exp_byconfig = true;
                }
            }
        }
    }
    else if (pid.startsWith("hdfd")) {
        const { DAYMARK, BUYDAYMARK, DAYLIMIT, PACK } = global.gameconfig.zhd.HDFD;
        let daymark = ctx.role.getProp(DAYMARK);
        ctx.assert(DAYLIMIT > daymark, "alreadly buy");
        price = PACK.PRICE;
        let [, index] = pid.split("_");
        index = Number.parseInt(index);
        out = [
            ...PACK.REWARD[index], // 根据累计充值天数获得不同奖励
            { GSID: DAYMARK, COUNT: 1 },
        ];
        // BUYDAYMARK 一天只加一次
        if (daymark == 0) out.push({ GSID: BUYDAYMARK, COUNT: 1 });
        if (PACK.EXP) {
            ctx.role.addItemsNoSave({ gsid: 38003, count: PACK.EXP });
            exp_byconfig = true;
        }
    }
    // 卧龙战令-通行证
    else if (pid.startsWith("warorder")) {
        const one = await global.dao.warorder.findOne({ rid }, { charge: 1 });
        ctx.assert(one, "not active");
        const { buytime = 0, price: p, exp, reward } = one.charge;
        ctx.assert(buytime == 0, "already buy");
        one.charge.buytime = Date.now();
        one.markModified("charge");
        await one.save();
        price = p;
        out = reward;
        if (exp) {
            ctx.role.addItemsNoSave({ gsid: 38003, count: exp });
            exp_byconfig = true;
        }
    }
    // 特惠基金
    else if (pid.startsWith("thjj")) {
        let config = global.gameconfig.zhd[pid.toUpperCase()];
        ctx.assert(config, "invalid config");
        let record = ctx.role[pid] || {};
        ctx.assert((record.isbuy || 0) == 0, "already buy");
        record.isbuy = 1;
        ctx.role[pid] = record;
        ctx.role.markModified(pid);
        price = config.PRICE;
        out = config.REWARD;
        if (config.EXP) {
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
            exp_byconfig = true;
        }
    }
    // 拍卖行礼包
    else if (pid.startsWith("auctionpack")) {
        const [, type, index] = pid.split("-")
        let config = global.gameconfig.auctionpack.PACK[index]
        ctx.assert(config, "invalid config");
        let one = await global.dao.c_auctionpack.findOne({ rid: ctx.role.i(), type })
        ctx.assert(one, "invalid pack")
        let record = one.record || []
        ctx.assert(record.filter(Boolean) == 0, "already buy")
        let now = Date.now()
        record[index] = `${now}_1`
        one.end = now
        one.record = record
        one.markModified("record")
        await one.save()
        price = config.PRICE;
        out = config.REWARD;
        if (config.EXP) {
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
            exp_byconfig = true;
        }
    } else if (pid.startsWith('cwh')) {
        const config = global.gameconfig.cwh.PRODUCT[pid];
        ctx.assert(config, 'invalid pid');
        let [, cycle] = pid.split('_');
        ctx.role.addItemsNoSave(config.MARK);
        if (cycle === 'djdaily') {
            let index = moment().weekday();
            out.append(config.ITEMS[index]);
        } else {
            out.append(config.ITEMS)
        }
        price = config.PRICE;
    }
    // 武将升星礼包
    else if (pid.startsWith('generalstar')) {
        let [, index] = pid.split('_');
        index = parseInt(index);
        let { GIFT } = global.gameconfig.generalstar;
        let giftInfo = GIFT[index];
        ctx.assert(giftInfo, 'invalid id');
        price = giftInfo.PRICE;
        await global.dao.generalstar.updateOne({
            rid: ctx.role._id,
        }, {
            $inc: { [`buylimit.${index}`]: 1 }
        });
        out = [...out, ...giftInfo.ITEMS];
        if (giftInfo.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: giftInfo.EXP });
        }
    }
    // 福袋
    else if (pid.startsWith('fudai')) {
        let _tmp = pid.split('_'); // fudai_yd_hyfd_1
        let index = _tmp.pop(); // 取出尾部
        index = parseInt(index);

        const startPrefix = _tmp.shift(); // 取出首部

        // 如果此时的_tmp长度大于1，则用_进行拼接 ["yd","hyfd"]=>"yd_hyfd"
        const hdType = _tmp.length > 1 ? _tmp.join('_') : _tmp[0];
        const toUp = hdType.toUpperCase();

        const config = global.gameconfig.zhd_newhero[toUp] || global.gameconfig.zhd[toUp];
        if (!config) throw new Error('miss zhd config:' + toUp);

        const fdConfig = config.FUDAIS ? config.FUDAIS[index] : null;
        if (!fdConfig) throw new Error('miss zhd config index:' + index);

        price = fdConfig.PRICE;
        console.log('<--- startPrefix =', startPrefix, ctx.role[startPrefix], hdType, index)
        // 记录购买次数
        let bought = ctx.role[startPrefix][hdType].buycount[index] || 0;
        ctx.role[startPrefix][hdType].buycount[index] = ++bought;

        // 是否开启下一个购买时间
        //if(ctx.role[startPrefix][hdType].buycount[index] >= fdConfig.LIMIT){ }
        ctx.role[startPrefix][hdType].unlocktime = moment().add(1, 'd').startOf('day').valueOf(); // 下一天解锁
        // 记录购买福袋的下标
        let buyidx = ctx.role[startPrefix][hdType].buyindex || 0;
        ctx.role[startPrefix][hdType].buyindex = ++buyidx;

        ctx.role.markModified(`${startPrefix}.${hdType}`);

        out = [...out, ...fdConfig.ITEMS];
        if (fdConfig.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: fdConfig.EXP });
        }

        // 福袋红点
        ctx.zhdpoint('FUDAI_RED', ctx.role, hdType);
    }
    // 珍宝每日特惠
    else if (pid.startsWith('zbdp')) {
        // 只有一个
        let info = pid.split("_");
        const config = global.gameconfig.zhenbao_dailypack[info[info.length - 1]];
        ctx.assert(config, 'invalid index');
        const {
            PRICE,
            ITEMS,
        } = config;
        price = PRICE;
        out = ITEMS;
    }
    // 珍宝基金
    else if (pid.startsWith('zbfund')) {
        let [_, index] = pid.split("_");
        // 
        const config = global.gameconfig.zhenbao_fund[index];
        ctx.assert(config, 'invalid index');
        // 设置已购买状态
        if (index == 0) ctx.role.zhenbao_fund_buytime = Date.now();
        else ctx.role.zhenbao_fund_buytime1 = Date.now();

        const {
            PRICE,
            ITEMS,
        } = config;
        price = PRICE;
        out = ITEMS;
        // 红点推送
        pushClient(ctx.role, {
            type: 'zhenbao',
            content: 1,
        });
    } // RMB定制礼包
    else if (pid.startsWith('dzlbrmb')) {
        let [
            id,
            choice0 = 0,
            choice1 = 0,
        ] = pid.split('_').slice(1);
        let index = pid.startsWith('dzlbrmb2') ? 2 : "";
        let config = global.gameconfig["dzlbrmb" + index].deepQueryOne('ID', Number.parseInt(id));
        ctx.assert(config, 'invalid rmbdzlb');
        let key = "dzlbrmb" + index;
        ctx.role[key] = ctx.role[key] || {};
        ctx.role[key][id] = ctx.role[key][id] || 0;
        ctx.role[key][id]++;
        ctx.role.markModified(key);
        price = config.PRICE;
        if (config.EXP) {
            exp_byconfig = 1;
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        }
        out = [...config.ITEMS];
        // 根据选线取奖励数据
        let choicelist = [
            Number.parseInt(choice0),
            Number.parseInt(choice1),
        ]
        let _config = global.gameconfig["dzlbchoicermb" + index];
        ctx.assert(_config, 'invalid _config');
        for (let [i, choice_set_id] of Object.entries(config.CHOICE)) {
            let info = _config[choice_set_id];
            ctx.assert(info, 'invalid choicesetid');
            let _out = info[choicelist[Number.parseInt(i)]];
            ctx.assert(_out, `invalid choiceitems${i}`);
            out.push(_out);
        }
    }
    // gm后台操作下单的
    else if (pid.startsWith('gmsys')) { // pid = gmsys_charge1000_100_100
        let [_, type, ybNum, expNum] = pid.split('_');
        ctx.assert(type, 'invalid pid');
        ctx.assert(type.startsWith('charge'), 'invalid pid');
        price = parseInt(type.replace('charge', ''));
        out.push({ gsid: 38005, count: +ybNum });
        exp_byconfig = true;
        ctx.role.addItemsNoSave({ gsid: 38003, count: +expNum });
    }
    // 神将特惠
    else if (pid.startsWith("sjth")) { // pid = sjth_0_1

        let [hdlb, id, index] = pid.split("_");
        index = parseInt(index);
        let config = global.gameconfig.sjth.find((value) => {
            return value.id == id;
        })
        ctx.assert(config, "config invaild");
        let record = ctx.role[hdlb][id] || [];
        if (id == 1) {
            record = ctx.role.sjth["sjzy"] || record;
        } else if (id == 2) {
            record = ctx.role.sjth["godzf"] || record;
        } else if (id == 3) {
            record = ctx.role.sjth["sgy"] || record;
        } else if (id == 4) {
            record = ctx.role.sjth["magicsmy"] || record;
        }

        let expNum = 0;
        if (index < config.ITEM.length) {
            let info = config.ITEM[index];
            ctx.assert(info, 'invalid index');
            ctx.assert(info.REWARD, 'invalid REWARD');
            expNum = info.EXP;
            price = info.PRICE;
            out.push(...info.REWARD)
            if (info.SPEC_GSID0 && info.SPEC_COUNT0) {
                out.push({ GSID: info.SPEC_GSID0, COUNT: info.SPEC_COUNT0 })
            }
            let bought = record[index] || 0;
            record[index] = ++bought;
        }
        else {
            expNum = config.EXP;
            price = config.PRICE;
            out = [{ GSID: config.SPEC_GSID0, COUNT: config.SPEC_COUNT0 }];
            for (let i = 0; i < config.ITEM.length; i++) {
                let bought = record[index] || 0;
                record[index] = ++bought;
                let info = config.ITEM[i];
                out.push(...info.REWARD);
                if (info.SPEC_GSID0 && info.SPEC_COUNT0) {
                    out.push({ GSID: info.SPEC_GSID0, COUNT: info.SPEC_COUNT0 });
                }
            }
        }
        if (id == 1 && ctx.role.sjth["sjzy"]) {
            ctx.role.sjth["sjzy"] = record;
        } else if (id == 2 && ctx.role.sjth["godzf"]) {
            ctx.role.sjth["godzf"] = record;
        } else if (id == 3 && ctx.role.sjth["sgy"]) {
            ctx.role.sjth["sgy"] = record;
        } else if (id == 4 && ctx.role.sjth["magicsmy"]) {
            ctx.role.sjth["magicsmy"] = record;
        }
        else {
            ctx.role[hdlb][id] = record;
        }
        // 充值的经验读取配置表
        exp_byconfig = true;
        ctx.role.addItemsNoSave({ gsid: 38003, count: +expNum });
        ctx.role.markModified(`${hdlb}`)
    }
    else if (pid.startsWith('fllb')) {
        const [key, index] = pid.split('_');
        let config = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
        ctx.assert(config, "config invaild");
        config = config.ITEMS[index];
        ctx.assert(config, "config invaild" + index);
        let data = ctx.role[key] || { record: [], luck: 0 };
        out = config.ITEMS.map(({ GSID, COUNT }) => {
            let obj = { GSID, COUNT: GSID == 38005 ? COUNT + Math.floor(COUNT * data.luck) : COUNT };
            return obj;
        })
        price = config.PRICE;
        let bought = data.record[index] || 0;
        data.record[index] = ++bought;
        ctx.role[key] = data;
        ctx.role.markModified(key);
        exp_byconfig = true;
        ctx.role.addItemsNoSave({ gsid: 38003, count: +config.EXP });
    }
    else if (pid.startsWith('hglb')) {
        const [key, index] = pid.split('_');
        let config = global.gameconfig.zhd_newhero[key.toUpperCase()] || global.gameconfig.zhd[key.toUpperCase()];
        ctx.assert(config, "config invaild");
        let MARK = config.MARK;
        config = config.ITEMS[index];
        ctx.assert(config, "config invaild" + index);
        let data = ctx.role[key] || [];
        out = config.ITEMS.arrange();
        price = config.PRICE;
        let bought = data[index] || 0;
        data[index] = ++bought;
        ctx.role[key] = data;
        ctx.role.markModified(key);
        exp_byconfig = true;
        ctx.role.addItemsNoSave([{ gsid: 38003, count: +config.EXP }, { GSID: MARK, COUNT: config.SCORE }]);
    } else if (pid.startsWith('ssdb')) {
        //神树夺宝
        const [key, index] = pid.split('_');
        let result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })
        let config = global.gameconfig.ssdb[3].find(e => e.ID == index)
        ctx.assert(config, 'error config ');
        //更新限购次数 
        let update = {}
        update[`gift.${index}`] = result?.gift[index] ? result.gift[index] + 1 : 1
        await global.dao.ssdbRole.updateOne({ rid: ctx.role.rid }, { $set: update })
        ctx.role.addItemsNoSave(config.item);

    }
    else if (pid.startsWith('panda')) { // 熊猫充值
        // gjxb 
        const [_, key, index, id] = pid.split('_');
        const file = 'panda_' + key + id;
        let config = global.gameconfig[file];
        ctx.assert(config, "config invaild " + file);
        let data = ctx.role.panda[key];
        ctx.assert(data, "invaild data " + key);
        if (index == 'fund') {
            data.base.fund = 1
            ctx.role.markModified('panda.' + key);
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: +config.base.FUND_EXP });
        }
        else {
            config = config.shop[index];
            out = config.ITEMS.arrange();
            price = config.PRICE;
            let bought = data.shop[index] || 0;
            data.shop[index] = ++bought;
            ctx.role.markModified('panda.' + key);
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: +config.EXP });
        }
    }
    else if (pid.startsWith("specialexp") || pid.startsWith("specialadv") || pid.startsWith("specialmoney")) {//登录赏令
        const right_config = global.gameconfig.right[pid];
        ctx.assert(right_config, 'invalid right');
        out.append(right_config.REWARD);

        let prefix = pid.replace('special', '');
        prefix = prefix.split("_")[0];
        // 非自然日
        if (right_config.DAY > 0) {
            ctx.role.special[prefix] = Date.now() + right_config.DAY * 24 * 60 * 60 * 1000;
        } else if (right_config.DAY < 0) {
            // 永久特权
            ctx.role.special[prefix] = 9999999999999;
        }
        // 自然日(月卡)
        if (right_config.NDAY) {
            let day = ctx.role.special[prefix] || 0;
            day += right_config.NDAY;
            ctx.role.special[prefix] = day;
        }
        ctx.role.markModified('special.' + prefix);

        if (right_config.EXP) {
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: right_config.EXP });
        }
        ctx.role.markModified('special.' + prefix);
        price = right_config.NUM;
        const config = global.gameconfig.recharge[pid];
        if (config) {
            price = config.PRICE;
        }
    }
    else {
        const config = global.gameconfig.recharge[pid];
        ctx.assert(config, 'invalid pid');
        price = config.PRICE;
        if (config.TYPE === 'RECHARGE') {
            out.push({ gsid: 38005, count: config.YB });
            if (config.EXTRA) {
                try {
                    ctx.role.castItemsNoSave({ gsid: config.EXTRA.MARK, count: 1 });
                    out.push({ gsid: 38005, count: config.EXTRA.YB });
                } catch (e) {
                }
            }
            // 充值的经验读取配置表
            exp_byconfig = true;
            ctx.role.addItemsNoSave({ gsid: 38003, count: config.EXP });
        } else if (config.TYPE === 'RIGHT') {
            const right_config = global.gameconfig.right[pid];
            ctx.assert(right_config, 'invalid right');
            out.append(right_config.REWARD);

            let prefix = pid.replace('special', '');
            let is_xufei = false;
            // 非自然日
            if (right_config.DAY > 0) {
                ctx.role.special[prefix] = Date.now() + right_config.DAY * 24 * 60 * 60 * 1000;
            } else if (right_config.DAY < 0) {
                // 永久特权
                ctx.role.special[prefix] = 9999999999999;
            }
            // 自然日(月卡)
            if (right_config.NDAY) {
                if (ctx.role.special[prefix] > 0) is_xufei = true;
                let day = ctx.role.special[prefix] || 0;
                day += right_config.NDAY;
                ctx.role.special[prefix] = day;
            }
            if (right_config.EXP) {
                exp_byconfig = true;
                ctx.role.addItemsNoSave({ gsid: 38003, count: right_config.EXP });
            }
            ctx.role.markModified('special.' + prefix);
            const fn = actions({ prefix });
            if (fn) await fn({ ctx, is_xufei });
        }
    }
    if (!exp_byconfig) ctx.role.addItemsNoSave({ gsid: 38003, count: price * 10 });
    ctx.zhdpoint('LJCZ', ctx.role, amount);
    ctx.zhdpoint('LXLJCZ', ctx.role, amount);
    ctx.zhdpoint('HGLB', ctx.role);
    ctx.zhdpoint('JTHL', ctx.role, amount, "zhd");
    ctx.zhdpoint('JTHL', ctx.role, amount, "forever");
    ctx.zhdpoint('TJFX', ctx.role, amount);
    ctx.zhdpoint('XCRW_CHARGE', ctx.role, amount);
    ctx.zhdpoint('ZJD_POINT', ctx.role, 98310); //欢乐砸金蛋-充值1次
    await ctx.pandapoint('EVENT_RECHARGE', ctx.role, amount); //熊猫充值事件

    if (!_virtual) { // 模拟充值 不发放累计充值的标记
        ctx.role.addItemsNoSave([
            { gsid: 90221, count: amount },
            { gsid: 90222, count: amount },
        ]);
    }

    // 返利统计--begin
    if (global.config.REBATE && global.config.REBATE == 1) {
        let udp = {
            $set: {
                exp: ctx.role.getItems(38003).count,
            },
        }
        if (await global.dao.rebate.fetch(pid)) {
            udp.$inc = {
                [pid]: 1,
            }
        }
        else {
            udp.$inc = {
                price: price,
            }
        }
        await global.dao.rebate.updateOne({ uid: ctx.role.uid }, udp, { upsert: true });
    }
    // 返利统计--end

    let { bymail } = ctx.request.body;
    if (bymail) {
        let {
            icon,
            title = 'payment',
            content = 'payment',
        } = bymail;
        await ctx.dao.mail.create({
            type: 2, rid: ctx.role._id,
            icon, title, content,
            reward: out,
        })
    } else {
        ctx.role.addItemsNoSave(out, 'recharge');
    }

    var result = ctx.zhdpoint('CZPHB', ctx.role, amount);

    await ctx.role.save();
    if (result) {
        let id = "czphb"
        let rankService = new global.services.RankService(`${id}-${global.gameconfig[id][0][1].key}`);
        let score = Math.ceil(ctx.role.getItems(global.gameconfig[id][0][1].key).count)
        await rankService.set({
            id: ctx.role.i(),
            score: score
        });
    }
    // 主动推充值成功
    pushClient(ctx.role, ctx.request.body, "O_RECHARGE");
    if (OLD_VIP !== ctx.role.vip) { // vip 等级提升
        // ctx.role.vip
        houseLampNotify.call(ctx, 'vip', ctx.role.vip).catch(console.error);
    }
    ctx.body = {};
    ctx.role.notifyRecharge('confirm', orderid, pid, amount);
    console.error(`PAYMENTDELIVER>> ${ctx.role.uid} ${pid}    ${price} ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    if (is_first) {
        ctx.role.notifyRecharge('first', orderid, pid, amount);
        console.error('FRISTCHARGE>>', ctx.role.servid, ctx.role.uid, ctx.role.level, pid, price, moment().format('YYYY-MM-DD HH:mm:ss'));
    }
    try {
        await ctx.zhdpoint('GUANYU_RECHARGE_HOOK', ctx.role);
    } catch (e) {
        console.error(e);
    }
}
