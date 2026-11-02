'use strict'

module.exports = exports = async function (role, pid) {
    const [key, stage, index, id] = pid.split('_');
    let config = global.gameconfig[key];
    if (!config) throw new Error('miss hsgc');
    let shop = config.shop[id];
    if (!shop) throw new Error('miss hsgc shop id:',id);
    shop = shop[stage];
    if (!shop) throw new Error('miss hsgc shop stage:',stage);
    let info = shop[index];
    if (!info) throw new Error('miss hsgc index:',index);

    let arr = [{GSID:info.MARK, COUNT:1}, ...info.REWARD];
    let price = 0;
    if (info.PRICE) {
        arr.push({gsid: 38003, count: info.EXP});
        price = info.PRICE;
    }

    return [arr, price, true];
}
    