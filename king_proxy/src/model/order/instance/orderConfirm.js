/**
 * 发货
 */

'use strict';

const assert = require('assert');

module.exports = async function (transactionid, receipt) {
  // 需要先挂载发请求的
  const deliver = global.dao.order.deliver;
  assert(deliver, 'delivernexists');
  this.confirm = Date.now();
  this.transactionid = transactionid;
  this.receipt = receipt;
  await this.save();
  let {
    host,
    rid,
    pid,
    oid,
    price,
  } = this;
  try {
    await deliver(host, rid, pid, oid, price);
    this.deliver = Date.now();
  } catch (e) { // 这里 用 try catch ,因为远程函数的异常和assert 都是 以错误形式抛出的
    assert.fail('DELIVERERR>> ' + (oid) + ":" + e);
  }


  await this.save();
}
