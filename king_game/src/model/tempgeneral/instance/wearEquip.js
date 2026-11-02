
'use strict'

const assert = require('assert');
// 穿装备和宝物
module.exports = exports = async function (equips, treasure) {
    let _self = this;
    let _equips = equips
    let list = [];
    for (let i = 0; i < _equips.length; i++) {
        let config = global.gameconfig.equip[_equips[i]];
        assert(config, 'invalid equip');
        let pos = config.POS - 1;
        list[pos] = parseInt(_equips[i]);
    }
    if (treasure) {
        let tconfig = global.gameconfig.treasure[treasure];
        assert(tconfig, 'invalid treas');
        _self.treasure = parseInt(treasure);
        _self.markModified('treasure');
    }
    _self.equip = list;
    _self.markModified('equip');
    return _self;
}