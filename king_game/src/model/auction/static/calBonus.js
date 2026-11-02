'use strict';

/**
 * 同拍卖方计算分红
 */
module.exports = async function (list, owner) {
    if (list.length <= 0) {
        return {
            def: 0,
        };
    }
    let totalSellPrice = 0;
    let totalBasePrice = 0;
    let totalFirstAuction = 0;
    let bounceType = list[0].bounceType;
    let auctioneer = list[0].auctioneer;
    const bounce = Boolean(list[0].bounceList && list[0].bounceList.includes(owner));
    for (const o of list) {
        const h = o.history[o.history.length - 1] || {price: 0};
        totalSellPrice += h.price;
        totalBasePrice += o.basePrice;
        totalFirstAuction += (o.firstAuction || 0);
    }

    let bonusFunc; // 分红函数
    let bonusRoles = list[0].bounceList || [];
    const [tp, ] = auctioneer.split('_'); // 根据规则，取出拍卖类型 LEGION 则为军团拍卖 ALL 为全服拍卖
    const auctioneerType = tp.toUpperCase();

    if (!global.gameconfig.auction[auctioneerType].bonusFunc) { // 第一次构造 分红函数
        global.gameconfig.auction[auctioneerType].bonusFunc = new Function('SELL_PRICE', 'BASE_PRICE', 'FIRST_AUCTION', 'WIN', 'CEO', 'return ' + global.gameconfig.auction[auctioneerType].BONUS_FUNC);
    }
    bonusFunc = global.gameconfig.auction[auctioneerType].bonusFunc;

    // 通用分红对象
    const bonusObj = {
        def: Math.round(bonusFunc(totalSellPrice, totalBasePrice, totalFirstAuction, bounceType === 'WIN' ? 1 : 0, 0)),
        bounce,
        bonusRoles,
    }
    if (auctioneerType === 'LEGION') { // 军团分红

        const legion = await global.dao.legion.findOne({_id: auctioneer.replace('legion_', '')}, {_members: 1});
        if (!legion) {
            return {
                def: 0,
                bonusRoles,
                bounce,
            };
        }
        const _members = legion._members;


        const ceo = _members.find(_ => _.pos === 2) || {rid: 'NULL'}; // 得到 ceo

        return {
            ...bonusObj,
            [ceo.rid]: Math.round(bonusFunc(totalSellPrice, totalBasePrice, totalFirstAuction,  bounceType === 'WIN' ? 1 : 0, 1)),
            bonusRoles,
        };
    }

    return bonusObj;
};
