
'use strict'

module.exports = async ctx => {
  const zfarr = await ctx.dao.zhenfa.getZfAll(ctx.role._id);
	ctx.body = global.gameconfig.zhenfa.map(conf =>{
    let entity = zfarr.deepQueryOne('zid', conf.ID);
    if (entity) return entity.info();
    return {
      id: conf.ID,
      state: 0,
      pos: ctx.dao.zhenfa.getPosById(conf.ID),
    }
  })
}