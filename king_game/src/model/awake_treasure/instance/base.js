/**
 * 整理数据格式给前端
 */


'use strict'

module.exports = async function () {
  let property = Object.entries(this.property).map(([key, val]) =>{
    return {key, val};
  })
  return {
    guid: this._id.toString(),
    gsid: this.gsid,
    property,
    awake: this.awaketime? 1: 0,
  }
}