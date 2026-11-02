
'use strict'
// 职业试炼-开始战斗
const occtowerConfig = global.gameconfig.occtower.TOWERINFO;
module.exports = exports = async (ctx, next) => {
  let {type } = ctx.request.body;
  ctx.assert(type >= 1, 'invalid type');
  let towerInfo = await ctx.dao.tower.findOne({ rid: ctx.role._id, occu: type, type: 'occutower' }, { record: 1 });
  let recordNum = 1;
  let bossId = 0;
  let config;
  if (towerInfo) {
    recordNum = towerInfo.record.length +1;
    config = occtowerConfig[type][recordNum - 1];
    ctx.assert(config, 'invalid config');
    bossId = config.ID;
  } else {
    // 第一关
    config = occtowerConfig[type][0];
    ctx.assert(config, 'invalid config first');
    bossId = config.ID;
  }
  // 判断挑战的阵容是否满足配置表需要的武将数
  let player = await ctx.role.getBattleSet(`occtower${type}`)
  ctx.assert(Object.keys(player.team).length >= config.UP_NUM, 'no enough general');

  // mark 用于记录挑战的类别和楼层,用于日后保存录像取标识
  let battle = new ctx.dao.c_battle({
    rid: ctx.role._id,
    type: 'occtower',
    player,
    mark: `${recordNum}_${type}`
  });

  await battle.createEnemy(bossId).save();
  ctx.body =  battle.base();
}
