
'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.body = Object.values(ctx.generalMap ).map(g => g.base());
}
