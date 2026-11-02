'use strict'

const secretTask = require("../../../../model/secretRealmRole/instance/secretTask");

module.exports = exports = async (ctx, next) => {
    let { dropid: DROPID, time = 1 } = ctx.request.body;
    let boxInfo = ctx.config.BOX.find(doc => {
        return doc.DROPID == DROPID;
    })
    ctx.assert(boxInfo, "invalid boxInfo");
    if (DROPID >= 1006) {
        time = 1;
    }
    ctx.role.castItemsNoSave({ GSID: boxInfo.COST.GSID, COUNT: boxInfo.COST.COUNT * time });
    let reward = [];
    if (DROPID == 1006) {
        let level = global.gameconfig.function_luck.MANOR.REQUIRE_COUNT;
        ctx.assert(ctx.role.level >= level, "not yet unlocked");
        ctx.assert(!ctx.role.bless.manor, "already bless");
        ctx.role.bless.manor = Date.now();
        ctx.role.markModified("bless.manor");
    }
    else if (DROPID == 1007) {
        ctx.assert(ctx.role.legion, "no join legion");
        ctx.assert(!ctx.role.bless.legion, "already bless");
        ctx.role.bless.legion = Date.now();
        ctx.role.markModified("bless.legion");
    }
    else {
        for (let id of boxInfo.DROPS) {
            let config = ctx.config.DROP.find(doc => {
                return doc.DROPID == id;
            })
            ctx.assert(config, "invalid config info");
            for (let i = 0; i < time; i++) {
                config.REWARD.forEach(value => {
                    if (value.START && Date.in(value.START, value.END) == false) {
                        return
                    }
                    if (ctx.random.hit(value.RATE, 100)) {
                        reward.push({ GSID: value.GSID, COUNT: value.COUNT });
                    }
                })
            }
        }
    }
    ctx.role.addItemsNoSave(reward);
    ctx.role.addItemsNoSave([{ GSID: ctx.config.SCORESIGN, COUNT: boxInfo.SCORECOUNT * time }]);
    ctx.body = {
        reward,
        score: ctx.role.getProp(ctx.config.SCORESIGN),
        time: boxInfo.TIME ? Date.now() + boxInfo.TIME * 60000 : 0,
    };
    await ctx.role.save();
    //秘境主线任务打点
    await secretTask(ctx, 99540, time)
}