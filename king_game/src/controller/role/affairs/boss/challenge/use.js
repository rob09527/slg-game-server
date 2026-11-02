'use strict'

module.exports = exports = async (ctx, next) => {

    const phys = ctx.role.fbossphys;
    ctx.assert(phys > 0, 'nmore phys');
    ctx.role.fboss.num++;
    ctx.role.fboss.last = Date.now();
    ctx.role.markModified('fboss');

    await next();

    if (ctx.boss.totaldamges >= ctx.config.BOSSHP) {
        ctx.boss.killed = 1; // boss 标记删除
        ctx.body.kill = 1;

        // @author awko , 邮件发放改为 领取

        // belong,激活将
        ctx.boss.reward = {
            [ctx.boss.rid]: [...ctx.config.RACTIVE.map(o => ({...o, active: 1}))],
        }
        // killer 击杀奖
        const ownerId = ctx.role.i();
        ctx.boss.reward[ownerId] = ctx.boss.reward[ownerId] || [];
        ctx.boss.reward[ownerId].push(...ctx.config.RKILL.map(o => ({...o, kill: 1})));

        // 参与奖
        for (const info of ctx.boss.roles) {
            // if (info.rid === ownerId) { // 击杀者 不会获得 参与奖
            //     continue;
            // } else if(ctx.boss.rid === info.rid){ // boss 激活者，不获得参与奖
            //     continue;
            // }
            // @time 2021-11-02 修改，参与奖励可以和其他奖励叠加
            ctx.boss.reward[info.rid] = ctx.boss.reward[info.rid] || [];
            ctx.boss.reward[info.rid].push(...ctx.config.RCHALLENGE);
        }

    }
    await Promise.all([ctx.boss.save(), ctx.role.save()])
}
