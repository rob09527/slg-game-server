
'use strict'

const { assert } = require('console');
const random = require('./../../../util/random');

/**
 * 生成新的印记
 * @param rid {string}
 * @param gsid {string or int}
 */
module.exports = exports = function (rid, gsid,sec) {
  let signet = global.gameconfig.signet[gsid];
  assert(signet,'signet config not exists')
  const {CAMPPOOL,OCCUPOLL} = global.gameconfig.signet_roll_others;
  let prop = {};
  if(signet.QUALITY <=5){
      let ci = Math.floor(Math.random()*CAMPPOOL.length);
      prop.camp = CAMPPOOL[ci];
  };
  if(signet.QUALITY == 5){
      let oi = Math.floor(Math.random()*OCCUPOLL.length);
      prop.occu = OCCUPOLL[oi];
  };
  if(sec && typeof sec === 'object' && sec.camp && sec.occu){
    prop.camp = sec.camp;
    prop.occu = sec.occu;
  }
  if(signet.QUALITY == 6){
      let generalPool = global.gameconfig.signet_general_pool;
      let rates = generalPool.deepMap('W');
      let index = random.inweight(rates);
      let ggsid = generalPool[index].GSID;
      if(sec && typeof sec === 'object' && sec.gsid){
        ggsid = sec.gsid;
      }
      let general = global.gameconfig.general[ggsid];
      prop.gsid = ggsid;
      prop.camp = general.CAMP
      prop.occu = general.OCCU;
  };
  let obj = {
    rid,
    gsid,
    prop
  };
  return obj;
}
