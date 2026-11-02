/**
 * 付费人数
 */

'use strict';

// const assert = require('assert');

module.exports = async function () {
  global.serverPayNum = {};
  const data = await this.aggregate([
      {$match: {confirm: {$exists: true}}},
      {$project: {rid: 1, servid: 1}},
      {$group:{_id:{rid: "$rid",servid: "$servid"}}},
      {$group:{_id:"$_id.servid",count:{$sum:1}}}
  ]);
  data.forEach(info => {
      global.serverPayNum[info._id] = info.count;
  })
}
