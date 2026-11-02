
'use strict'
// 夺宝活动-机关傀儡选择稀有奖励
module.exports = exports = async function (ctx, next) {
    let { gsid = 0 } = ctx.request.body;
    // 判断是否在稀有奖励里
    const config = global.gameconfig.zhd.JGKL;
    ctx.assert(config,'invalid config');
    let rareConfig = config.TYPE1 || [];
    let data = rareConfig.find((rare)=>rare.GSID == gsid);
    ctx.assert(data,'invalid gsid');
    // 记录选择的稀有奖励。
    if (data && data.GSID){
        ctx.role.jgkl = {gsid:data.GSID};
        ctx.role.markModified('jgkl');
        await ctx.role.save();
    } 
    ctx.body = {};
}