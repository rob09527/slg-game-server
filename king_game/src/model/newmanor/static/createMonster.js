'use strict'
const assert = require('assert');
/**
 * 创建野外boss
 */
module.exports = exports = function (lv) {
    let config = global.gameconfig.newmanor_monster[lv];
    if (!config) {
        // 生成最后一个关卡数
        let keys = Object.keys(global.gameconfig.newmanor_monster).length;
        config = global.gameconfig.newmanor_monster[keys];
        lv=lv-1;
    }
    let { MAPIDS: mapids, BOSSGROUP: bossgroup } = config;
    let { FRIEND_BOSS_HELP: friend_help } = global.gameconfig.newmanor.CONFIG;
    let bossinfo = [];
    let monsters = [];
    // 计算boss总血量
    let bset = global.gameconfig.battlenewmanorboss[bossgroup];
    assert(bset, 'bset config err');
    // 算总血量
    let maxhp = 0;
    for (let info in bset) {
        maxhp += bset[info].exhp;
    }
    bossinfo.push({
        nowhp: maxhp,
        maxhp,
        invitecount: friend_help,
        id: bossgroup,
        state: 1,
        lastdamage: 0,
        totaldamage: 0
    })

    /**
  * monsters
  * [
  * {
  *  "state":1击杀,3击杀,
  *  "mapid":10xxx
  * }
  * ]
  * 
  */
    for (let m of mapids) {
        let obj = {};
        obj.state = 1;
        obj.id = m;
        monsters.push(obj);
    }
    return { monsters, bossinfo,lv }
}
