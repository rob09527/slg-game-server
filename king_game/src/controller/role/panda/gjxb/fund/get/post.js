
'use strict'

module.exports = exports = async (ctx, next) =>{

    let { score } = ctx.request.body;
    score = parseInt(score)
    let items = [];
    if (score > 0) {
        let config = ctx.CONFIG.fund[score];
        ctx.assert(config, 'invalid score ' + score);
        let flag = ctx.CACHE.fund[score] || 0;
        ctx.assert(flag < 2, 'is got');
        ctx.assert(ctx.CACHE.base.score >= score, 'limit score');

        // 免费
        if(flag == 0) {
            flag = 1;
            items = config.ITEMS;
        }
        // 付费
        if(flag == 1 && ctx.CACHE.base.fund) {
            items = [...items, ...config.PAYS];
            flag = 2;
        }
        ctx.CACHE.fund[score] = flag;
    }
    else {
        // 一键领取
        for (const score in ctx.CONFIG.fund) {
            let config = ctx.CONFIG.fund[score];
            if(ctx.CACHE.base.score >= score){
                let flag = ctx.CACHE.fund[score] || 0;
                if(flag < 2){
                    // 免费
                    if(flag == 0) {
                        flag = 1;
                        items = [...items, ...config.ITEMS];
                    }
                    // 付费
                    if(flag == 1 && ctx.CACHE.base.fund) {
                        items = [...items, ...config.PAYS];
                        flag = 2;
                    }
                    ctx.CACHE.fund[score] = flag;
                }
            }
        }
    }
    ctx.role.addItemsNoSave(items, {main: 'gjxb', sec: 'get_'+score});
    ctx.role.markModified('panda.gjxb');

    await ctx.role.save();
    ctx.body = {
        items,
        fund: ctx.CACHE.fund
    }
}
