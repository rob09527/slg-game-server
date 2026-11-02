
'use strict'

const { ok } = require('assert');
const getpos = require('./../common/getpos');
/**
 * 返回阵法数据
 */

module.exports = function() {
  const conf = global.gameconfig.zhenfa.deepQueryOne('ID', this.zid);
  ok(conf, 'invalid zfid'+this.zid);
  let skillID = conf.LV[this.star];
  ok(skillID, 'invalid zflv'+this.star);
  skillID = skillID.SKILLID;
  // 各阵基等级属性
  const base = this.base.map((doc, idx) =>{
    return this.getBase(idx).info;
  })
  // 所有属性加成
  const attr = [
    // 阶级加成
    ...global.gameconfig.zhenfa_star[this.zid - 101].slice(0, this.level).map(({ATTR}) => ATTR),
    // 所有阵基属性
    ...base.map(({attr}) => attr),
  ]
  .filter(Boolean)
  .reduce((cur, attr) =>{
    for (let [k, v] of Object.entries(attr)) {
      cur[k] = cur[k] || 0;
      cur[k] += v;
    }
    return cur;
  }, {})

  return {
    // 星级加成
    pickAttr: global.gameconfig.zhenfa?.[this.zid - 101].LV[this.star].ATTR,
    state: 1,
    id: this.zid,
    lv: this.level,
    skillID,
    base,
    attr,
    pos: getpos(this.zid),
  }
}