'use strict'
const {fpool} = require('../../../util/random');

/**
 * 卡牌随机逻辑
 */
module.exports = function (star) {
    let pools = global.gameconfig.nmaze.CARD_POOL || [];
    const selcards = this.selcards || [];
    const selTmp = {};
    selcards.forEach(id => {
        selTmp[id] = selTmp[id] || 0;
        selTmp[id] ++;
    });
    const types = new Set();
    pools.forEach(p => {
        types.add(+p.TYPE);
    });
    const arr = [...types];
    arr.shuffle();
    const getTypes = arr.slice(0,3); // 随机3个类型卡片
    const outpools = [];
    for (const type of getTypes) { //  每个类型随机一个
        const _pools = pools.filter(p => +p.TYPE === type && (p.LIMIT === -1 || !selTmp[p.ID] || selTmp[p.ID] < p.LIMIT) );
        const c = fpool(_pools, 1, 'WEIGHT');
        if(c[0]) {
            outpools.push(c[0].ID);
        }
    }

    return outpools;
}
