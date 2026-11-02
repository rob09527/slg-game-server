
'use strict'
// 商品购买
module.exports = exports = async (ctx, next) => {
    let { index, pos } = ctx.request.body;
    ctx.assert(index >= 0 && index <= 3, 'invalid index');
    ctx.assert(pos >= 0 && pos <= 2, 'invalid pos');
    // 更改节点状态
    let node = ctx.nowchapter.nodes[ctx.nowchapter.row + 1][pos];
    ctx.assert(node, 'invalid node');
    // 判断商品数量
    ctx.assert(node.goods.length > 0, 'invalid goods');
    let getgoods = node.getgoods || [];
    let bought = getgoods[index] || 0;
    // 只能够买一次
    ctx.assert(bought < 1, 'no more');
    let goodInfo = node.goods[index];
    ctx.assert(goodInfo, 'invalid goods index');
    ctx.role.castItemsNoSave(goodInfo.cast, { main: 'maze', 'sec': 'event shop' });
    ctx.role.addItemsNoSave(goodInfo.items, { main: 'maze', 'sec': 'event shop' });
    // 设置节点完成
    getgoods[index] = ++bought;
    node.getgoods = getgoods;
    ctx.nowchapter.nodes[ctx.nowchapter.row + 1][pos] = node;
    ctx.nowchapter.markModified('nodes')
    await ctx.role.save();
    await ctx.nowchapter.save();
    ctx.body = {
        items: goodInfo.items,
        node
    }
}
