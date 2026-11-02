/**
 * 印记
 */
'use strict'



module.exports = exports = {
	rid: {type: String, require: 1, index: 1},
  
  gsid: {type: Number, require: 1, index: 1},
  /**
   *  鉴定
   * appraise:{
    type:{type: Number},
    attrs:{type: Object}
  },
   */
  appraise:{type: Object},
  // 所属
  prop: {
    //所属阵营
    camp:{type: Number},
    //所属职业
    occu:{type: Number},
    //所属武将
    gsid:{type: Number},
    attrs:{type:Object}
  },
  // 被装备的武将id
  general: {type: String},
	// 创建时间
	create: {type: Number, default: Date.now},
}