
/*  
  国战区服之间的对战记录  
*/

'use strict'


module.exports = exports = {
  // 对战组。 
  groupmark: { type: String, require: 1 },
  // 对战组站位编号 area1_area2
  areastand: { type: String, require: 1 },
  /**
   *  {
   *  left: [{
   *    l_role:{servid:xx,uid:'xxx','way':'front/back','direction':'left/right'},
   *    r_role:{servid:xx,uid:'xxx','way':'front/back','direction':'left/right'},
   *    result:"win"/"lose",
   *    videoid:"xxxxx"
   *    }],
   * 
   *   right:[{}]
   * 
   *  }
   * }
   */

  // 战报,以及挑战记录
  report: { left: [], right: [] },
  create: { type: Number }

}