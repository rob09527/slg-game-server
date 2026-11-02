


'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('equip'), 'equip lock'); // 装备如果继承，则不能进行穿戴
    await next();
}
