'use strict';

// 解锁随从
module.exports = exports = async (ctx, next) => {

    // 目前只要解锁随从
    ctx.request.body.type = 'retinue'; // 目前只有 随从才需要手动解锁
    const {type, pos, consumeType = ""} = ctx.request.body;
    const GEN = ctx.gOfficial[type];

    // 得到已经解锁的武将官职位
    const unlockRetinue = Object.keys(GEN).sort((a, b) => b - a);
    const currentMaxRetinue = +(unlockRetinue[0] || 0);
    ctx.assert(+pos === currentMaxRetinue + 1, 'cant unlock this pos'); // 不能跳跃解锁
    // if (type === 'retinue') {
    //     ctx.assert(Object.values(ctx.gOfficial.official).filter(o => o && isNaN(o)).length === 10, 'cant unlock this pos'); // 官职任命完之后才能解锁随从
    // }
    ctx.body = {};
    const checkRequire = (POS) => {
        const c = ctx.config[type.toUpperCase()][POS];
        if (!c) {
            ctx.assert.fail('error pos');
        }
        for (let k in c.UNLOCK_REQUIRE) {
            if (ctx.role.getProp(k) < c.UNLOCK_REQUIRE[k]) { // 只要有一项不满足
                ctx.assert.fail('cant unlock require ' + k);
            }
        }
        const CONSUME_KEY = 'UNLOCK_CONSUME'+consumeType;
        if (c[CONSUME_KEY]) { // 有设置消耗
            if (+consumeType === 2 && c[CONSUME_KEY].length === 0){ // 2号消耗方案，如果为空，表示不支持该方案
                ctx.assert.fail('invalid consumption');
            }
            ctx.body.castitems = c[CONSUME_KEY];
            ctx.role.castItemsNoSave(ctx.body.castitems);
        } else {
            ctx.assert.fail('invalid consumption')
        }
    };
    checkRequire(pos);
    ctx.role.general_official[type][pos] = null;
    ctx.role.markModified('general_official');
    await ctx.role.save();

};
