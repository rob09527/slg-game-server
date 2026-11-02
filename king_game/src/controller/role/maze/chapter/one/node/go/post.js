
'use strict'
// 节点-前往
module.exports = exports = async (ctx, next) => {
    let { index } = ctx.request.body;
    ctx.assert(index >= 0 && index <= 2, 'invalid index');
    // 判断是否允许走这个节点
    // 获取当前层数的的长度
    if (ctx.nowchapter.row != -1) {
        let nodes = ctx.nowchapter.nodes[ctx.nowchapter.row].length;
        ctx.assert(nodes >= 2, 'node count err');
        // 获取下一层的长度
        let nextnodes = ctx.nowchapter.nodes[ctx.nowchapter.row + 1];
        ctx.assert(nextnodes && nextnodes.length >= 1, 'no next node');
        nextnodes = nextnodes.length;
        if (nextnodes > 1) {
            if (nodes == 2) {
                // 2个节点
                if (nextnodes == 3) {
                    if (ctx.nowchapter.pos == 0) {
                        // 能去0-1
                        ctx.assert(index == 1 || index == 0, 'no go');
                    } else if (ctx.nowchapter.pos == 1) {
                        // 能去1 -2
                        ctx.assert(index == 1 || index == 2, 'no go');
                    }
                }
            } else {
                // 3个节点
                if (nextnodes == 2) {
                    if (ctx.nowchapter.pos == 0) {
                        ctx.assert(index == 0, 'no go');
                    } else if (ctx.nowchapter.pos == 1) {
                        ctx.assert(index == 0 || index == 1, 'no go');
                    } else if (ctx.nowchapter.pos == 2) {
                        ctx.assert(index == 1, 'no go');
                    }
                }
            }
        }
    }
    // 设置下一个节点状态
    ctx.nowchapter.nodes[ctx.nowchapter.row + 1][index].state = 1;
    ctx.nowchapter.markModified('nodes');
    await ctx.nowchapter.save();

    ctx.body = ctx.nowchapter.nodes[ctx.nowchapter.row + 1][index];
}