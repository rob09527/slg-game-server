
'use strict'
// 节点事件放弃
module.exports = exports = async (ctx, next) => {
    // 只有type 5神秘绿洲 6天师左慈 8西域商店 可以放弃
    // 查节点的类型
    let nodes = ctx.nowchapter.nodes[ctx.nowchapter.row + 1];
    ctx.assert(nodes && nodes.length > 0, 'no event');
    let _index = 0;
    let typeInfo = nodes.find((node, index) => {
        _index = index;
        return node.state == 1;
    });
    let types = [5, 6, 8];
    ctx.assert(typeInfo && types.includes(typeInfo.type), 'invalid type');
    // 设置节点为完成
    ctx.nowchapter.pos = _index;
    ctx.nowchapter.nodes[ctx.nowchapter.row + 1][_index].finish = Date.now();
    ctx.nowchapter.row++;
    ctx.nowchapter.markModified('nodes');
    await ctx.nowchapter.save();
    ctx.body = {}
}