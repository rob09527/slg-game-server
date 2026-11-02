/**
 * 用这个方法替代create
 */
'use strict'

module.exports = async function(rid, zid) {
  let doc = {
    rid,
    zid,
  }
  doc.base = [];
  for (let i = 0; i < 3; i++) {
    doc.base.push({
      blv: 0,
      lv: 0,
    })
  }
  return await this.create(doc);
}