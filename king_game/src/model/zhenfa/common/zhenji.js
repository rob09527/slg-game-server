
'use strict'

const { ok } = require("assert");

class ZhenJi {
  // 阵法实体
  zhenfa;
  // 阵基位置
  index;

  constructor({zhenfa, index, blv, lv}) {
    this.zhenfa = zhenfa;
    this.index = index;
  }
  /**
   * 根据下标返回阵法中对应的阵基
   * @param {object} zhenfa 阵法数据实体
   * @param {*} index 阵基下标
   * @returns 
   */
  static fetchBase(zhenfa, index) {
    ok(zhenfa.base, 'invalid zhenfa');
    ok(zhenfa.base[index], 'base nexist');
    return new ZhenJi({zhenfa, index});
  }

  /**
   * 阵基保存数据
   * @returns Promise
   */
  save() {
    return this.zhenfa.save();
  }

  /**
   * 突破等级getter/setter
   */
  get blv() {
    return this.zhenfa.base[this.index].blv;
  }
  set blv(num) {
    this.zhenfa.base[this.index].blv = num;
  }
  /**
   * 等级getter/setter
   */
  get lv() {
    return this.zhenfa.base[this.index].lv;
  }
  set lv(num) {
    this.zhenfa.base[this.index].lv = num;
  }
  /**
   * 获取相关信息
   */
  get info() {
    return {
      br_lv: this.blv,
      lv: this.lv,
      attr: this.getAttr(),
    }
  }

  /**
   * 升级
   */
  lvUp() {
    this.lv++;
    this.zhenfa.markModified(`base.${this.index}.lv`);
  }
  /**
   * 突破等级升级
   */
  blvUp() {
    this.blv++;
    this.zhenfa.markModified(`base.${this.index}.blv`);
  }
  /**
   * 
   * @returns 获取所有加成
   */
  getAttr() {
    // 等级属性加成
    const attr_lv = global.gameconfig.zhenfa_zjlv[this.zhenfa.zid].slice(0, this.lv).reduce((cur, conf) =>{
      const _attr = conf?.[this.index].ATTR;
      if (conf) {
        for (let [k, v] of Object.entries(_attr)) {
          cur[k] = cur[k] || 0;
          cur[k] += v;
        }
      }
      return cur;
    }, {});
    // 突破等级属性加成
    const attr_br = global.gameconfig.zhenfa_zjbr[this.zhenfa.zid].slice(0, this.blv).reduce((cur, conf) =>{
      const _attr = conf.ZJ?.[this.index].ATTR;
      if (conf) {
        for (let [k, v] of Object.entries(_attr)) {
          cur[k] = cur[k] || 0;
          cur[k] += v;
        }
      }
      return cur;
    }, {})

    const attr = [
      attr_lv,          // 等级属性加成
      attr_br,  // 突破等级属性加成
    ]
    .filter(Boolean)
    .reduce((cur, attr) =>{
      for (let [k, v] of Object.entries(attr)) {
        cur[k] = cur[k] || 0;
        cur[k] += v;
      }
      return cur;
    }, {})
    return attr;
  }
}

module.exports = ZhenJi;