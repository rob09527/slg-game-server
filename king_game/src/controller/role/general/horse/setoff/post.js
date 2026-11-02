'use strict'

// 卸下

module.exports = exports = async (ctx, next) => {
    const {pos} = ctx.request.body
    ctx.general.horse.guids[pos] = '';
    ctx.general.markModified('horse.guids');
    ctx.horse.owner = '';
    ctx.horse.pos = -1;
    ctx.general._horse_[pos] = null;

    ctx.body = {
        info: ctx.horse.base(),
    }
}
