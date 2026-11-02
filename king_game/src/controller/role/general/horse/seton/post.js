'use strict'

// 激活

module.exports = exports = async (ctx, next) => {
    const {SET_ON} = global.gameconfig.horsesetting;

    let {id,pos} = ctx.request.body;
    ctx.assert(pos >= 0 && pos < SET_ON, 'err horse');

    ctx.horse = await ctx.role.findHorses(id);
    ctx.assert(ctx.horse, 'err horse');
    ctx.assert(!ctx.horse.owner, 'err owner');

    ctx.body = {};

    if(ctx.general.horse.guids[pos]){
        let horse = await ctx.role.findHorses(ctx.general.horse.guids[pos]);
        if(horse){
            horse.owner = '';
            horse.pos = -1;
            await horse.save();

            ctx.body.off = horse.base();
        }
    }
    
    ctx.general.horse.guids[pos] = ctx.horse._id.toString();
    ctx.general.markModified('horse.guids');
    ctx.horse.owner = ctx.general._id.toString()
    ctx.horse.pos = pos;

    ctx.body.info = ctx.horse.base();
}
