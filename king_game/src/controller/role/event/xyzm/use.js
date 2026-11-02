
'use strict'

module.exports = async (ctx, next) =>{

  const key = ctx.role.isXS('xs_xyzm') ? 'xs_xyzm': 'xyzm';
	ctx.KEY = ctx.role.isXS(key)  ? ctx.role.isXSConKey(key).toUpperCase():key.toUpperCase();
	ctx.config = global.gameconfig.zhd[ctx.KEY];
  ctx.assert(ctx.config , 'fn freeze');
	ctx.assert(ctx.zhdpoint("ISZHD", key) , 'fn freeze');
  // 默认值增加
  ctx.role.xyzm = ctx.role.xyzm || {};
  ctx.role.xyzm = {...{recruit: {friend: 0, normal: 0, premium: 0}, rolltimes: 0, record: []}, ...ctx.role.xyzm}
  await next();
}