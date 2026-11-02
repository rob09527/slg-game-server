/**
 * 返回印记信息
 * 
 *  {
    guid:'136479465'
    gsid: '135464646',
    //鉴定,没有这个属性则表示还没有鉴定
    appraise:{
        type:1/2,//1 阴 2 阳
        attrs:{
            "atk":10//鉴定属性
        }
    },
    // 所属
    prop: {
        camp:1-6,// 阵营限制
        occu:1-6,// 职业限制
        gsid:10001,// 武将限制
        attrs:{
            "atk":10//属性
        }
    }
 }
 * 
 */
'use strict'
const _ = require('lodash');

const assert = require('assert');

module.exports = function() {
  let config = global.gameconfig.signet[this.gsid];
  assert(config, 'invalid stonegsid');
  this.prop.attrs = config.ATTRS;
  if(this.prop.gsid){
    let general = global.gameconfig.general[this.prop.gsid];
    let name = general.NAME;
    let gsids = [];
    for (const key in global.gameconfig.general) {
          if (Object.hasOwnProperty.call(global.gameconfig.general, key)) {
              if(global.gameconfig.general[key].NAME == name){
                  gsids.push(key)
              };
          };
    };
    let sg_conf = null;
    for (let index = 0; index < gsids.length; index++) {
          const g = gsids[index];
          sg_conf =  global.gameconfig.signet_general[g];
          if(sg_conf) break;
      }
    if(sg_conf) this.prop.attrs.gsid = sg_conf.ATTRS;
  };
  return {
    guid: this._id.toString(),
    gsid: this.gsid,
    prop: this.prop,
    appraise:this.appraise,
    general:this.general
  };
}