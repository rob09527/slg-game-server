
'use strict'

module.exports = async (ctx, next) =>{
  let {
    consume,
  } = ctx.request.body;
  // 去重
  consume = Array.from(new Set(consume));
  let stonelist = await ctx.dao.soulstone.find({_id: {$in: consume}});
  stonelist = consume.map(guid => {
    for (let stone of stonelist) {
      if (stone._id.toString() !== guid) continue;
      return stone;
    }
  })
  ctx.assert(stonelist.length !== consume, 'invalid stone');
  ctx.request.body.consume = stonelist;
  await next();
}