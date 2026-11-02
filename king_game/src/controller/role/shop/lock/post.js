'use strict'

// 锁定商品位置
module.exports = exports = async (ctx, next) => {
    const index = parseInt(ctx.request.body.index);
    const lock = +ctx.request.body.lock || 0;
    let good = ctx.shop_cache.goods[index];
    ctx.assert(good, 'invalid goods');
    if(lock) {
        ctx.assert(ctx.shop_cache.goods.filter(g => g.lock === 1 && g.BUYTIME).length < 1, 'lock limit'); // 只能一个商品位置能锁定
    }
    good.lock = lock ? 1 : 0;
    ctx.shop_cache.markModified('goods');
    ctx.shop_cache.save();
    ctx.body = {
        goods: ctx.shop_cache.goods,
    }
}
