'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index] = pid.split('_');
    let record = role.mrthyj || [];
    let reward = [], PRICE = 0;
    if (index < global.gameconfig.mrthyj.ITEMS.length) {
        let config = global.gameconfig.mrthyj.ITEMS[index];
        if (!config) throw new Error('miss mrthyj config:', config, " index:", index);
        let bought = record[index] || 0;
        record[index] = ++bought;
        reward.push(...config.ITEMS);
        PRICE = config.PRICE;
    }
    else {
        global.gameconfig.mrthyj.ITEMS.forEach((value, pos) => {
            if (value.PRICE == 0) { return }
            reward.push(...value.ITEMS);
            let bought = record[pos] || 0;
            record[pos] = ++bought;
        })
        PRICE = global.gameconfig.mrthyj.PRICE;
    }

    role.mrthyj = record;
    role.markModified('mrthyj');

    role.addItemsNoSave({ gsid: 38003, count: PRICE * 10 });

    return [reward, PRICE, true]
}
