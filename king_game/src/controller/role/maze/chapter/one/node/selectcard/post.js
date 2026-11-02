
'use strict'
// 选择卡片奖励
module.exports = exports = async (ctx, next) => {
    let { index, pos } = ctx.request.body;
    ctx.assert(index >= 0 && index <= 2, 'invalid index');
    ctx.assert(pos >= 0 && pos <= 2, 'invalid pos');
    let node = ctx.nowchapter.nodes[ctx.nowchapter.row][pos];
    ctx.assert(node, 'invalid node');
    node.choicecard = 1; // 假数据
    // ctx.assert(node.choicecard, 'invalid cardlist');
    node.finish = Date.now();
    ctx.nowchapter.nodes[ctx.nowchapter.row][pos] = node;
    ctx.nowchapter.markModified('nodes');
    await ctx.nowchapter.save();
    // let cardbag = await ctx.mazecards.addcardbag({cardid:node.choicecard});
    // ctx.mazecards.cardbag = cardbag;
    // ctx.mazecards.markModified('cardbag');
    // await ctx.mazecards.save();
    ctx.body = {
        node,
        cardbag: []
    }
}