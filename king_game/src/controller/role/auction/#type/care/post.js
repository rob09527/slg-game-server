'use strict';

require('rx-apiwheel');

/**
 *    拍品关注
 * @type {exports}
 */
module.exports = exports = async ctx => {
    const {_id, id, care = 1} = ctx.request.body;
    const auc = await ctx.dao.auction.findOne({_id: _id || id});
    ctx.assert(auc, 'not exists');
    ctx.assert(auc.expireAt > Date.now(), 'expire'); // 商品已经过期
    const upd = {};
    const rid = ctx.role.i();
    auc.noticer =  auc.noticer || {};
    if (care) {
        upd.$set = {[`noticer.${rid}`]: 1};
        auc.noticer[rid] = 1;
    } else {
        upd.$unset = {[`noticer.${rid}`]: 1};
        delete auc.noticer[rid];
    }
    await ctx.dao.auction.updateOne({_id: auc._id}, upd);
    await auc.bindMember();
    ctx.body = {
        auction:  auc.base(rid)
    }
};
