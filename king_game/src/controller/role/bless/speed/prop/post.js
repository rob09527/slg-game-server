'use strict'

module.exports = exports = async (ctx, next)=>{
    let {dropid:DROPID, time = 1} = ctx.request.body;
    ctx.assert(DROPID >= 1006, "dropid error");
    let type = DROPID == 1006 ? "manor" : "legion";
    ctx.assert(ctx.role.bless[type] > 0, "not need speed");

    let boxInfo = ctx.config.BOX.find(doc =>{
        return doc.DROPID == DROPID;
    })
    ctx.assert(boxInfo && boxInfo.SPEED, "invalid boxInfo");
    let t = 0, now = Date.now() - boxInfo.TIME * 60000, speedTime = boxInfo.SPEED.TIME * 60000;
    let typeTime = ctx.role.bless[type];
    for (; t < time; t++) {
        typeTime -= speedTime;
        if (typeTime <= now) {
            break;
        }
    }
    ctx.role.bless[type] = typeTime;
    ctx.role.castItemsNoSave({GSID:boxInfo.SPEED.GSID, COUNT:boxInfo.SPEED.COUNT * (t+1)});
    ctx.role.markModified("bless."+type);
    await ctx.role.save();
    ctx.body = {
        time: ctx.role.bless[type] + boxInfo.TIME * 60000 ,
    };
}