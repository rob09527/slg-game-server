'use strict';

const debug = require('debug')('event:atyzm:recruit');

const randPool = function (ctx, gfloor, [min, max], actg, actIndex, star = 1) {
    let generals = global.gameconfig.recruit_activity[actIndex].filter(function (g) {
        const config = global.gameconfig.general[g.ID];
        if (!config) return false;
        return config.STAR == star &&
            ((ctx.role.level >= g.MINLV && ctx.role.level <= g.MAXLV) || (ctx.role.vip >= g.MINVIP && ctx.role.vip <= g.MAXVIP))
    })
    ctx.assert(generals.length > 0, 'invalid config')
    // 前 min 次不给活动武将
    if (gfloor < min) {
        generals = generals.filter(g => g.ID != actg);
    } else if (gfloor == max - 1) { // 保底 max 次必中活动武将
        generals = global.gameconfig.recruit_activity[actIndex].deepQuery('ID', actg);
    }
    let rates = generals.deepMap('CHANCE');
    const general = generals[ctx.random.inweight(rates)];
    ctx.assert(general, 'invalid general');
    // 保底之外抽到活动武将则重置保底次数
    debug(general.ID, actg)
    if (general.ID === actg) {
        gfloor = 0;
        debug('got zhe general')
    }else{
        gfloor++;
        debug('gfloor++', gfloor)
    }
    return [general, gfloor];
}

const castOrAdd = function (ctx, mark, above) {
    const hereCount = ctx.role.getProp(mark);
    let fn = above >= hereCount ? 'addItemsNoSave' : 'castItemsNoSave';
    debug({fn, mark, above, hereCount, del: hereCount - above})
    ctx.role[fn]({ GSID: mark, COUNT: Math.abs(hereCount - above) });
}

module.exports = async function (ctx, next) {
    const {
        times = 1,
    } = ctx.request.body;
    const {
        STARRATE,
        FREEMARK,
        STARFLOOR,
        GFLOOR,
        ATYG,
        COST,
        TOTALMARK,
    } = ctx.config;
    debug(ctx.config)
    debug(GFLOOR)
    const {
        FIRST: {
            MARK: _first_mark,
            COUNT: _first_max,
        }
    } = GFLOOR;
    let out = [];
    let castitems = [];
    if (ctx.role.getProp(FREEMARK) == 0 && times == 1) {
        // 首次单抽免费
        ctx.role.addItemsNoSave(FREEMARK);
    }else {
        // 活动道具消耗
        castitems = COST.deepQueryOne('TIMES', times);
        ctx.assert(castitems, 'castitems nexists');
        castitems = [castitems.ITEM];
        ctx.role.castItemsNoSave(castitems, 'recruit_activity');
    }
    // 抽奖次数(星级保底)
    let floorCount = ctx.role.getProp(STARFLOOR.MARK);
    // 抽奖次数(武将保底)
    let gfloor = ctx.role.getProp(GFLOOR.MARK);
    for (let i = 0; i < times; i++) {
        // 活动武将次数保底
        // 星级指定
        let star = ctx.random.inweight(STARRATE) + 1;
        // 星级保底
        if (floorCount >= STARFLOOR.COUNT) star = 5;
        if (star == 5) {
            floorCount = 0;
        } else {
            floorCount++;
        }
        /**
         * 抽奖次数区间,[min, max],例
         * space = [20, 40]
         * 前20次必不出,如21~39都没抽到,则第40次必出
         * min                     max
         * |-------|---------------保底
         * |-必不出-|-----可能出-----|
         * |-------|---------------|
         */
        let _is_frist_floor = true;
        // 判断是否有首次保底
        if (ctx.role.getProp(_first_mark) >= 1) _is_frist_floor = false;
        let space = JSON.parse(JSON.stringify(GFLOOR.SPACE));   // clone
        // 如果从来没触发保底,则重新指定保底次数
        if (_is_frist_floor) space[1] = _first_max;
        const [
            _general,
            _gfloor,
        ] = randPool(ctx, gfloor, space, ATYG, ctx.actIndex, star);
        gfloor = _gfloor;
        out.push(_general);
        if (gfloor === 0 && _is_frist_floor) ctx.role.addItemsNoSave(_first_mark);
        debug({gfloor, space, _first_mark, firstcount: ctx.role.getProp(_first_mark)})
    }
    // 星级保底标记设置
    castOrAdd(ctx, STARFLOOR.MARK, floorCount);
    // 活动武将保底标记设置
    castOrAdd(ctx, GFLOOR.MARK, gfloor);
    out = out.map(g => ({ gsid: g.ID, reason: 'recruit_activity' }))
    ctx.role.addItemsNoSave(out);    // dev
    // 记录活动期间的总招募次数
    ctx.role.addItemsNoSave({ GSID: TOTALMARK, COUNT: times })
    // 圣兽来袭埋点
    // await ctx.zhdpoint('TNQW', ctx.role, times, 0, "sslx");  // 配置有误
    const newg = [].append((ctx.role.newg || []));
    await ctx.role.save();
    // 返回武将数据
    const generals = newg.map(function (doc) {
        doc._role = ctx.role;
        return doc.base();
    })
    // 前端兼容
    castitems = castitems.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }))
    ctx.body = {
        generals,
        castitems,
    };
}