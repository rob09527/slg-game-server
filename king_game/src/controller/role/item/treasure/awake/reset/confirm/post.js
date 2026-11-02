
'use strict'

module.exports = async (ctx, next) => {
  let {
    generalguid,
    treasure,
    confirm,
  } = ctx.request.body;
  let general = await ctx.role.findGenerals(generalguid);
  ctx.assert(general, 'general nexist');
  let awake_treasure = await ctx.dao.awake_treasure.findOne({_id: general.treasure});
  ctx.assert(general, 'treasure nexist');
  ctx.assert(awake_treasure.property_preview && Object.keys(awake_treasure.property).length > 0, 'preview nexist');
  confirm = Number.parseInt(confirm);
  if (confirm) {
    awake_treasure.property = awake_treasure.property_preview;
    awake_treasure.markModified('property');
  }
  awake_treasure.property_preview = undefined;
  awake_treasure.markModified('property_preview');
  await awake_treasure.save();
  general._awaketreasure = await awake_treasure.base();
  general = general.base();
  ctx.body = {
    general,
  }
}