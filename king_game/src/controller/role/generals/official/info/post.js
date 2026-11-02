'use strict';

// 官职随从信息查询
module.exports = exports = async (ctx, next) => {

    // 查询官职武将
    const guids = [...Object.values(ctx.gOfficial.official), ...Object.values(ctx.gOfficial.retinue)].filter(o=> (o+"").length === 24 );
    const generalMap = await ctx.role.findGenerals(guids);

    // 得到已经解锁的武将官职位
    const unlockOfficial = Object.keys(ctx.gOfficial.official).sort((a, b) => b - a);

    // 尝试自动解锁更高位官职
    let willUnLockOfficial = +(unlockOfficial[0] || 0) + 1;

    const result = {official: {},retinue: {}};
    // 标记是否有变化
    let changed = false;
    for (let type in result) {
        // 将武将信息放置到对应的位置
        for (const pos in ctx.gOfficial[type]) {
            const o = ctx.gOfficial[type][pos];
            const r = result[type];
            if( (o+"").length < 24){
                r[pos] = o;
                continue;
            }
            r[pos] = generalMap[o] ? generalMap[o].base() : null; //
            if (  generalMap[o] ){
                continue;
            }
            // 武将不在了释放位置
            const refreshConfig = ctx.config[`REFRESH_${type.toUpperCase()}`]; // 刷新冻结配置

            if (refreshConfig) {      // 卸任冻结时间
                r[pos] = Date.now() + refreshConfig.FREEZING_TIME * 3600 * 1000;
            }
            ctx.gOfficial[type][pos] = r[pos];
            changed = true;
        }
    }
    if (changed){
        ctx.role.general_official = ctx.gOfficial;
        ctx.role.markModified('general_official');
        await ctx.role.save();
    }
    const checkRequire = (officialIndex) => {
        const c = ctx.config.OFFICIAL[officialIndex];
        if (!c) {
            return false;
        }
        for (let k in c.UNLOCK_REQUIRE) {
            if (ctx.role.getProp(k) < c.UNLOCK_REQUIRE[k]) { // 只要有一项不满足
                return false;
            }
        }
        return true;
    };

    let needSave = false;
    while (checkRequire(willUnLockOfficial)) {
        result.official[willUnLockOfficial] = {NEW: true}; // 标记是刚解锁的，前端方便执行动画
        ctx.role.general_official = ctx.role.general_official || {official: {}, retinue: {}};
        ctx.role.general_official.official[willUnLockOfficial] = null;
        ctx.role.markModified('general_official');
        needSave = true;
        willUnLockOfficial += 1;
    }
    needSave && await ctx.role.save();
    ctx.body = result;
};
