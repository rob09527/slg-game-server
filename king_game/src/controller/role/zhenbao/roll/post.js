
'use strict'

const secretTask = require("../../../../model/secretRealmRole/instance/secretTask");

const TYPE = [
    'NORMAL',
    'PREMIUM',
]

module.exports = async ctx => {
    let {
        type: type_select,
        times,
    } = ctx.request.body;
    times = +times;
    ctx.assert(times, 'invalid times');
    type_select = TYPE[type_select];
    // 消耗道具
    let {
        CAST: _CAST,
        ITEMS: _ITEMS,
    } = global.gameconfig.zhenbao_roll_cast[type_select][times];
    // 免费是否冷却
    const {
        is_cooldown,
    } = ctx.role.isZbFreeRollCd();
    if (type_select === 'NORMAL' && times === 1 && is_cooldown) {
        // 使用免费
        ctx.role.zhenbao_free = Date.now();
    } else {
        // 消耗道具
        ctx.role.castItemsNoSave(_CAST);
    }
    // 发放必有道具
    const reward = _ITEMS.map(({ GSID, MIN, MAX }) => ({
        GSID,
        COUNT: ctx.random.between(MIN, MAX),
    }))
    ctx.role.addItemsNoSave(reward);
    // 摇奖
    const BAODI_COUNT = global.gameconfig
        .zhenbao_roll_others[`BAODI_${type_select}_COUNT`];
    let output = [];
    for (let i = 0; i < times; i++) {
        // 1.先判断是否本体(60碎片)
        const choice = global.gameconfig
            .zhenbao_roll_firstchoice[type_select];
        let rates = choice.deepMap('W');
        // 保底设置 BAODI_COUNT, 保底直接出本体
        let pool_type = choice[ctx.random.inweight(rates)].TYPE;
        const counter_key = `zhenbao_roll_counter4sure_${type_select.toLowerCase()}`;
        // 大于保底次数触发保底
        if (ctx.role[counter_key] >= BAODI_COUNT) {
            pool_type = 'ONE';
        }
        // 判断是否抽到本体,重置次数
        ctx.role[counter_key] = pool_type === 'ONE' ?
            0 : (ctx.role[counter_key] || 0) + 1;
        // 2.从对应奖池抽取奖励
        const pool = global.gameconfig[`zhenbao_roll_pool_${type_select.toLowerCase()}`][pool_type];
        rates = pool.deepMap('W');
        const index = ctx.random.inweight(rates);
        let item = pool[index];
        item = {
            GSID: item.ID,
            // 从配置的范围内随机数量
            COUNT: ctx.random.between(item.MIN, item.MAX),
        }
        output.push(item);
    }
    ctx.role.addItemsNoSave(output);
    if (type_select == TYPE[1]) {
        await ctx.jfhd({ name: 'cpjf', role: ctx.role, times }, 0).catch(console.error);
        ctx.zhdpoint("JFHD_RED", ctx.role, 'cpjf');

        await ctx.jfhd({ name: 'cpjf2', role: ctx.role, times }, 0).catch(console.error);
        ctx.zhdpoint("JFHD_RED", ctx.role, 'cpjf2');

        // 珍宝-增幅任务-高级寻宝次数
        await ctx.role.zhenbaoMissionInvoke({ missionName: 'ZB_PREMIUM_ROLL' });
    }
    const mission = `ZHENBAO_ROLL_${type_select}`
    await ctx.role.missionInvoke(mission, times)
        .save();

    output = output
        // 合并其他必发道具
        .append(reward)
        // 为前端显示过滤积分标记
        .filter(({ GSID }) => ![30131, 30132].includes(+GSID))
    ctx.body = {
        items: output,
    }
    //秘境主线任务打点
    await secretTask(ctx, 99563, times)
}