/**
 * 整理数据格式给前端
 * 返回格式如下
 * {
      seed: battle.seed,
      battleid: battle.i(),
      season: ctx.bseason().season,
      type: 'chapter',
      player: {}, // 玩家阵容
      enemy: {}, // 对手阵容
  }
 */


 'use strict'

const assert = require('assert');
const battleseason = require('./../../../util/battleseason');

module.exports = function () {

  const seasonInfo = battleseason();
  return {
    seed: this.seed,
    seedlist: this.player.bslist ? this.seedList(5) : undefined,
    battleid: this.i(),
    season: seasonInfo.season,
    type: this.type,
    player: this.player, // 玩家阵容
    enemy: this.enemy, // 对手阵容
    seasonInfo: this.season,

    lcards: this.lcards,

    rcards: this.rcards
  }
}
