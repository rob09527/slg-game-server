'use strict';

module.exports = exports = async (ctx, next) => {
    const {rwid, time = 1, castitems, idx = -1} = ctx.request.body;
    if (castitems){ // 校验消耗
        const items = ctx.activity.calConsume(ctx.role, rwid, "reward");
        const castObj = {};
        for (const s of castitems) {
            castObj[s.GSID || s.gsid] = s.COUNT || s.count;
        }
        if (items && items.length ){
            // 本来需要消耗，客户端无消耗，不匹配
            ctx.assert(castitems.length === items.length, "cast items invalid" )

            for (const t of items) { // 消耗数量不一致
                ctx.assert(castObj[t.GSID] == t.COUNT, "cast items invalid" )
            }
        }
    }
    const res = await ctx.activity.reward(ctx.role, rwid, time, idx);
    ctx.body = res;
};
