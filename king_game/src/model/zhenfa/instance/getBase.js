
'use strict'

const { ok } = require("assert");
const ZhenJi = require("../common/zhenji");

module.exports = function(index) {
  const doc = this.base[index];
  ok(doc, 'base nexist'+index);
  return ZhenJi.fetchBase(this, index);
}