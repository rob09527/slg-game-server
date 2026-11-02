/**
 * 整理数据格式
 */

 'use strict'

 module.exports = async function () {
   
   return {
     hdtype: this.hdtype,
     subtype: this.subtype,
     totals: this.totals,
     rewardtime: this.rewardtime,
   }
 }