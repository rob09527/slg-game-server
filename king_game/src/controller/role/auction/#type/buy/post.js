'use strict';

require('rx-apiwheel');

/**
 *    拍品竞拍购买
 * @type {exports}
 */
module.exports = exports = async ctx => {
    const {_id, id, isonce} = ctx.request.body;
    ctx.assert(ctx.request.body.price, 'price invalid');
    const auc = await ctx.dao.auction.findOne({_id: _id || id});
    ctx.assert(auc, 'not exists');
    ctx.assert(auc.start < Date.now(), 'not start'); // 未开始
    ctx.assert(auc.expireAt > Date.now(), 'expire'); // 商品已经过期

    const price = Math.min(ctx.request.body.price || 1, auc.price);
    const castitems = [{GSID: 38005, COUNT: price}];
    ctx.role.castItemsNoSave(castitems, {main: 'auction', sec: 'buy'});

    const TYPE = ctx.params.type.toUpperCase(); // ALL | LEGION
    const auctionConfig = global.gameconfig.auction[TYPE]; // 取出配置
    ctx.assert(auctionConfig, 'config not exists');

    // 商品过期时间达到临界值，每次拍卖成功延长一定过期时间
    const expendExpire = (auc.expireAt - Date.now() <= auctionConfig.C_TIME * 1000) ? auctionConfig.STEP_TIME * 1000 : 0;
    if (expendExpire > 0) { // 过期时间延长，初始化定时器
        ctx.dao.auction.refreshSchedule();
    }
    const opt = {_id: _id || id, status: 0};
    const upd = {
        $push: {
            history: {
                rid: ctx.role.i(),
                price: +price,
                isonce: !!isonce,
                create: Date.now(),
                state: false,
            },
        },
        $inc: {
            auctionPrice: auc.stepPrice,
            expireAt: expendExpire,
        },
    };
    if (price < auc.price) { // 非一口价购买
        opt.auctionPrice = +price; // 增加拍卖价格条件 (锁并发
    } else {
        upd.$set = { // 一口价出价时，直接售出
            status: 1,
        };
        // 因为一口价和竞拍文案不同所以要传递 isonce 字段
    }

    let r = await ctx.dao.auction.findOneAndUpdate(opt, upd,
        {
            new: true, // 返回修改后的数据
        });
    // 因为并发(抢拍)原因导致的失败
    const success = !!r;
    if (r) {
        // 推送全服 拍品修改
        const {care, to_receive, ...o} = r.base();
        if (TYPE === 'LEGION') { // 推单军团
            global.remote.pushClientLegion(ctx.role.legion, {
                type: 'auction', //
                content: o
            });
        } else {
            global.remote.pushClientAll(ctx.role._gameserv.groupid, {
                type: 'auction', //
                content: o
            });
        }

        if (r.status === 1) { // 已经售出，发送邮件
            await r.sendMailAndReward();
        }
        await ctx.role.save()
    } else { // 因为并发失败，再查询一下最新的拍品信息返回前端
        r = await ctx.dao.auction.findOne({_id: auc._id});
        // 清空消耗
        castitems.splice(0, castitems.length - 1);
    }

    // await r.bindMember();
    // 把购买过后的情况返回
    ctx.body = {
        auction: r.base(ctx.role.i()),
        success,
        castitems
    };
};
