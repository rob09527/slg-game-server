
'use strict'
/**
 * 从池子随出指定数量的数据
 * @param pools {array} // 随机池子
 * @param count {number} // 随出数量
 * @param weightKey {string} // 权重key字段名
 * @param repeatable {boolean} // 是否可重复，默认 false
 */
module.exports = function (pools,count,weightKey = 'WEIGHT', repeatable = false) {
    if(!count || !pools.length){
        return [];
    }
    let totalChance = 0;//pools.reduce((a,b) => (a[weightKey] || a) + (b[weightKey]||b) ); // 算出总 权重值
    pools.forEach(value=>{
        totalChance += value[weightKey] || 0;
    })

    const ballot = [];
    for (let i = 0; i < count; i++){ // 随机 count 张选票
        ballot.push(Math.random() * totalChance);
    }
    ballot.sort((a,b) => a - b); // 选票升序处理

    let currentSequence = 0;

    const out = [];

    let currentBallot ;
    for (let i = 0; i < pools.length; i++) {
        const g = pools[i];
        currentSequence += g[weightKey]; // 按照权重列队
        while (currentBallot || ballot.length !== 0) {
            if(!currentBallot){
                currentBallot = ballot.shift()
            }
            if(currentBallot > currentSequence){
                break;
            } else {
                out.push(g);
                currentBallot =undefined;
                if(!repeatable){
                    break;
                }
            }

        }
        if(!currentBallot && ballot.length === 0){
            break;
        }
    }
    return out;
}
