
'use strict'


module.exports = async ctx => {
  let {code} = ctx.request.body;
  ctx.assert(ctx.role.inviter == 0, 'saved inviter');
  const role = await global.dao.role.findOne({rno:+code}, {rno:1,servid:1})
  assert(role, 'err inviter');
  assert(role.rno != ctx.role.rno, 'err player');
  assert(role.servid == ctx.role.servid, 'err serverid');

  await global.dao.role.updateOne({rno: role.rno}, {$inc:{"others.90541.count":1}});
  ctx.role.inviter = code;
  const items = global.gameconfig.specialactivity.INVITECODE.SAVE;
  ctx.role.addItemsNoSave(items);
  await ctx.role.save();

  ctx.body = {
    items,
    inviter: code
  }
}