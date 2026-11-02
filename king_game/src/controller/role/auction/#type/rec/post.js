'use strict';

require('rx-apiwheel');

/**
 *    拍品返费领取
 * @type {exports}
 */
module.exports = exports = async ctx => {
    const {_id, id, ids } = ctx.request.body;
    const list = ids ? ids : [_id||id];


    const auctions = await ctx.dao.auction.find({_id: {$in: list}});
    let total = 0;
    const out = [];
    let member ;
    for (let auc of auctions) {
        if (!member){
            await auc.bindMember();
            member = auc._members;
        }
        auc._members = member;
        if (auc.expireAt < Date.now() ){
            out.push(auc.base(ctx.role.i()));
            continue;
        }

        const history = [].concat(auc.history);
        history.pop(); // 去掉最后一个记录（最后一个为竞拍榜首
        const owner = ctx.role.i();

        let i = 0;
        for (let i = 0; i < history.length; i++){
            const h = history[i];
            if(h.state){ // 已经返回的
                continue;
            } else if(h.rid !== owner){
                continue;
            }
            total += h.price;
            h.state = true;
            auc.markModified(`history.${i}.state`); // 并发优化，只更新自己的 history
        }

        out.push(auc.base(ctx.role.i()));
        await auc.save();
    }

    ctx.body = {
        items: [{GSID: 38005, COUNT: total}],
        auctions: out
    }
    ctx.role.addItemsNoSave( ctx.body.items);

    await ctx.role.save();
};
