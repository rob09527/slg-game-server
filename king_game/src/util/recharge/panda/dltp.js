'use strict'

module.exports = exports = async function (role, pid) {
    const [key, type, pos, index] = pid.split('_');
    let info = role.dltp.shop[type][pos];
    if (!info) throw new Error('miss info');
    let shop = info.shop[index];
    shop.buy++;
    role.markModified("dltp.shop."+type);

    let arr = [...shop.items];
    let price = 0;
    if (shop.type == 1) {
        role.addItemsNoSave({gsid: 38003, count: shop.exp});
        price = shop.price;
    }

    return [arr, price, true];
}