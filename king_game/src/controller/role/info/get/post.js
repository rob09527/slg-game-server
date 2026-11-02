'use strict'
const { start, day } = require("../../../../util/weektarget");
const { smsTime } = require("../../../../util/event/smanskin");


const modify_data = {
    hide: [],
    props: [],
    others: ["90215","90652"],
}

module.exports = exports = async (ctx, next) => {
    const now = Date.now();
    let _update_ = false;
    if(now - ctx._update_ >= 0 ){
        ctx._update_ = now + 60000; // 1分钟
        _update_ = true;
    }
    if( _update_ ){
        ctx.role.clearActNoSave(); // 清楚活动标记
    }
    ctx.body = await ctx.role.base();
    // 修改一些缓存数据
    for( let key in modify_data){
        for(let i = 0; i < modify_data[key].length; i++){
            let p = modify_data[key][i];
            if (!ctx.body[key][p]) {
                ctx.body[key][p] = {count:ctx.role.getProp(p)}
            }
            else {
                ctx.body[key][p].count = ctx.role.getProp(p)
            }
        }
    };
    // 获取 挂机 1分钟的收益数值
    const {items: configRewards} = ctx.role.reapRewardNoSave(60 * 1000);
    ctx.body.reap_config = configRewards; // 把一分钟收益返回给客户端

    ctx.body.general = undefined; // 武将数据单独返回
    // 七日目标全服开启时间
    ctx.body.weekt_start = start(ctx.role.servid);
    ctx.body.weekt_day = day(0);
    ctx.body.weekt_day_two = day(1);
    ctx.body.time = now; // 加上服务器时间返回
    // 代言人皮肤
    ctx.body.sman_skin_time = smsTime(ctx.role);

    ctx.body.warorder_time = await global.dao.warorder.duration(ctx.role);
    // 超值基金结束时间
    ctx.body.wfund_end = await ctx.dao.c_worthfund.duration(ctx.role);
    // 超值基金购买时间
    const fund = await ctx.dao.c_worthfund.fetch(ctx.role);
    ctx.body.wfund_bought = fund ? fund.fend : 0;

    // 重新计算战力
    const generals = await ctx.role.generals();
    ctx.body.power = ctx.role._power;

    if(!ctx._init_) return;
    // 已下为初始化才处理

    const horses = await ctx.role.horses();
    ctx.client.emit('HORSES', horses);

    const pets = await ctx.role.pets();
    ctx.client.emit('PETS', pets);

    ctx.client.emit('GENERALS', generals);
}
