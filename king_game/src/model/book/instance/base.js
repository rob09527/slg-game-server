/**
 * 整理数据格式给前端
 * 返回格式如下
 * {
    "guid": "604d116756259a49368dfb12",
    "gsid": 54551,
    "level": 1, // 强化等级
    "main": [
      {"key": "hp", "val": [25600, 0]}, // key:属性键,val: [基础属性值, 加成属性值]
      ...
    ],
    "rand": [
      {"key": "pcri", "val": [38, 123]},
      {"key": "mdef", "val": [38, 200]},
      {"key": "att", "val": [38, 0]},
      ...
    ],
    "awake": [
      {"key": "prdc", "val": 100},
      ...
    ]
  }
 */


 'use strict'

const assert = require('assert');

module.exports = async function () {
  // 兵书配置
  let config = global.gameconfig.bookitems[this.gsid];
  assert(config, 'invalid gsid');
  // 随机加强配置
  let config_add = global.gameconfig.bookstr.ADD[config.STAR - 1];
  assert(config_add, 'invalid star0');
  // 随机属性池
  let config_rand = global.gameconfig.book.RANDATTR[config.STAR - 1];
  assert(config_rand, 'invalid star1');
  config_rand = config_rand[config.POS - 1];
  assert(config_rand, 'invalid pos0');
  config_rand = config_rand.ATTRS;
  // 无双属性池
  let config_awake = global.gameconfig.bookawake.ATTR[config.POS - 1];
  assert(config_rand, 'invalid pos1');
  // 主属性
  let main = Object.entries(config.MAINATTR).map(([key, val]) =>{
    return {
      key: key.toLocaleLowerCase(),
      val: [
        val,
        config.STR_ADD * (this.level - 1),
      ]
    }
  });
  // 随机属性
  let rand = Object.entries(this.rand).map(([key, {str = 0}]) =>{
    // 基础值
    let val = config_rand.deepQueryOne('KEY', key);
    val = val? val.VAL: 0;
    // 强化加成值
    let str_add = config_add[key.toUpperCase()] || 0;
    return {
      key,
      val: [
        val,
        str_add * str,
      ]
    };
  })
  // 无双属性
  let awake = Object.keys(this.awake).map(key => {
    let val = config_awake.deepQueryOne('ATTR', key.toUpperCase());
    val = val? val.VAL: 0;
    return {
      key,
      val,
    }
  });
  // 总属性加成
  const attr = {};
  for (const item of [...main, ...rand, ...awake]) {
    attr[item.key] = attr[item.key] || 0;
    if (Array.isArray(item.val)) {
      attr[item.key] += (item.val[0] + item.val[1]);
    } else {
      attr[item.key] += item.val;
    }
  }

  return {
    guid: this._id.toString(),
    gsid: this.gsid,
    level: this.level,
    suit: config.SUIT,
    star: config.STAR,
    main,
    rand,
    awake,
    attr
  }
}
