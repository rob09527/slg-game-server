


'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('treasure'), 'treasure lock'); //  继承，则不能进行操作
    await next();
}
