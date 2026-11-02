'use strict'

module.exports = exports = async (ctx, next)=>{
    let {dropid:DROPID} = ctx.request.body;
    ctx.assert(DROPID >= 1006, "dropid error");
    if (DROPID == 1006) {
        let level = global.gameconfig.function_luck.MANOR.REQUIRE_COUNT;
        ctx.assert(ctx.role.level >= level,"not yet unlocked");
    }
    else {
        ctx.assert(ctx.role.legion, "no join legion");
    }
    let boxInfo = ctx.config.BOX.find(doc =>{
        return doc.DROPID == DROPID;
    })
    ctx.assert(boxInfo && boxInfo.OPEN == 0, "invalid boxInfo");
    let type = DROPID == 1006 ? "manor" : "legion";
    ctx.assert(ctx.role.bless[type] && ctx.role.bless[type] + boxInfo.TIME * 60 * 1000 <= Date.now(), 'time is not up');
    
    let reward = [];
    for (let id of boxInfo.DROPS) {
        let config = ctx.config.DROP.find(doc=>{
            return doc.DROPID == id;
        })
        ctx.assert(config, "invalid config info");
        config.REWARD.forEach(value=>{
            if (value.START && Date.in(value.START, value.END) == false) {
                return
            }
            if (ctx.random.hit(value.RATE, 100)) {
                reward.push({GSID: value.GSID, COUNT:value.COUNT});
            }
        });
    }
    
    ctx.role.addItemsNoSave(reward);
    ctx.role.bless[type] = 0;
    if (DROPID == 1007 && ctx.role.bless.speed) {
        ctx.role.bless.speed = 0;
        if (ctx.role.bless.help.length) {
            ctx.role.bless.help.splice(0);
        }
        ctx.role.castItemsNoSave({GSID:boxInfo.HELP.GSID, COUNT:ctx.role.getProp(boxInfo.HELP.GSID)});
    }
    ctx.role.markModified("bless");
    ctx.body = {
        reward,
    };
    await ctx.role.save();
}