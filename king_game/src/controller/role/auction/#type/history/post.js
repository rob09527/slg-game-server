'use strict';

require('rx-apiwheel');

/**
 *    个人竞拍记录
 * @type {exports}
 */
module.exports = exports = async ctx => {
    const {_id, id } = ctx.request.body;
    const owner = ctx.role.i();
    const TYPE = ctx.params.type.toUpperCase();
    const groupid = ctx.role._gameserv.groupid;

    const opt = {
        groupid
    };

    if (TYPE === "LEGION"){
        opt.auctioneer = 'legion_' + ctx.role.legion
    } else if (TYPE === "NORTH"){ // 北伐
        opt.auctioneer = "north"
    }
    //

    const ID = _id || id;
    if( ID ){
        opt._id = ID;
    }

    const list = await ctx.dao.auction.find({...opt,'history.rid' : owner});
    const out = [];
    for (let auc of list) {
        for (let h of auc.history) {
            if(h.rid !== owner){
                continue;
            }
            let get = 0;
            if(h === auc.history[ auc.history.length - 1]){ // 最后一个则是获得者
                get = 1;
            }
            out.unshift({
                item: auc.item,
                auctioneer: auc.auctioneer,
                get,
                ...h
            });
        }
    }

    const othersHistory = [];

    const aucList = await ctx.dao.auction.find({
        expireAt: {$lt: Date.now()},
        ...opt
    });

    // 关联查询用户数据
    const rids = [];

    for (let auc of aucList) {
        const last = auc.history.pop();
        if(last) {
            rids.push(last.rid);
            othersHistory.unshift({
                item: auc.item,
                status: 1,
                rname: '',
                ...last
            })
        } else {
            // 流拍
            othersHistory.unshift( {
                rname: '',
                item: auc.item,
                price: auc.auctionPrice,
                create: auc.expireAt, // 流拍的交易时间取过期时间
                status: 2
            })
        }

    }
    let showName = true; // 是否公开获得竞拍人信息
    if (TYPE === "LEGION"){
        const _legion = await ctx.dao.legion.findOne({_id: ctx.role.legion}, {_members: 1});
        const ownerInfo = _legion._members.find(o => o.rid === owner);
        const _mypos = ownerInfo && ownerInfo.pos; // 得到个人职位
        showName = _mypos === 2 ; // 军团战 需要展示 竞拍记录真实用户
    }

    if (showName){
        const roles = await ctx.dao.role.find({_id: {$in: rids}}, {rname: 1});
        const roleMap = {};
        roles.forEach(r => roleMap[r._id] = r.name);
        for (const h of othersHistory) {
            h.rname = roleMap[h.rid] || '';
        }
    }


    // 把购买过后的情况返回
    ctx.body = {
        owner: out,
        other: othersHistory
    };
};
