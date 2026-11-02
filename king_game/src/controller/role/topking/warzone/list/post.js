
'use strict'
// TODO 获取巅峰赛战区
module.exports = exports = async (ctx, next) => {

    let { servid } = ctx.request.body;
    ctx.assert(servid,'invalid servid');
    let warzonelist = await ctx.dao.topkingservergroup.distinct('areamark');
    let areamarkinfo = await ctx.dao.topkingservergroup.findOne({ servid });
    let my;
    if (areamarkinfo) my = areamarkinfo.areamark;
    ctx.body = { my, warzonelist };

}

