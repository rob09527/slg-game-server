'use strict';

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

// 官职 随从任命
module.exports = exports = async (ctx, next) => {

    const { type, pos, guid } = ctx.request.body;
    const GEN = ctx.gOfficial[type];
    ctx.assert(GEN, 'invalid type');
    ctx.assert(GEN[pos] !== undefined, 'this pos is not unlocked');
    if (typeof GEN[pos] === 'number') {
        ctx.assert(GEN[pos] <= Date.now(), 'this pos is freezing'); // 官职或者随从正处于冻结中，不能上新武将
    }
    const theConfig = ctx.config[type.toUpperCase()][pos];
    const otherType = type === 'official' ? 'retinue' : 'official'; // 检测对立类型是否有任命该武将
    ctx.assert(!Object.values(ctx.gOfficial[otherType]).includes(guid), 'this guid is used');
    console.log(ctx.role.rno, 'GENERAL ' + type.toUpperCase(), pos, guid);
    if (type === 'retinue') {
        const officialLength = Object.values(ctx.role.general_official.official).filter(_ => ("" + _).length == 24).length;
        ctx.assert(officialLength === Object.keys(ctx.config.OFFICIAL).length, 'official no full');
    }
    if (guid) {
        const g = await ctx.role.findGenerals(guid);
        ctx.assert(g, 'not found general');
        ctx.assert(!g.expireAt, 'cant use will expire general');

        if (theConfig.REQUIRE_LV) { // 有武将等级条件
            ctx.assert(g.level >= theConfig.REQUIRE_LV, 'general level x');
        }

        let lastPos;
        for (const p in GEN) {
            if (GEN[p] === guid) { // 选择武将已经有其他官职
                lastPos = p;
                break;
            }
        }
        if (lastPos) { // 已经有其他官职位，则进行互换官职
            let lastGuid = GEN[pos]; // 对应位置原本的 guid
            GEN[pos] = g._id.toString();
            GEN[lastPos] = lastGuid;
        } else {
            GEN[pos] = g._id.toString();
            // 如果不是位置互换，则需要进行同名检测
            if (type === 'official') { // 官职武将 同名武将不能都当官
                const guids = Object.values(GEN).filter(o => ("" + o).length == 24);
                const generalMap = await ctx.role.findGenerals(guids);
                const gid = Math.floor(g.gsid / 10);
                for (let k in generalMap) {
                    if (GEN[pos] === k) { // 忽略设置位置的武将
                        continue;
                    }
                    ctx.assert(Math.floor(generalMap[k].gsid / 10) !== gid, 'cant set  ' + g.gsid);
                }
            }
        }
    } else {
        // 卸任
        GEN[pos] = null;
        const refreshConfig = ctx.config[`REFRESH_${type.toUpperCase()}`]; // 刷新冻结配置
        // 卸任冻结时间
        if (refreshConfig) {
            GEN[pos] = Date.now() + refreshConfig.FREEZING_TIME * 3600 * 1000;
        }

    }
    ctx.role.markModified('general_official');
    await ctx.role.save();
    //秘境主线任务打点
    await secretTask(ctx, 99559, 1)
    // 暂时没有特定返回
    ctx.body = {
        castitems: [],
        items: [],
    };
};
