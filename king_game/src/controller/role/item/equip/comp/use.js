
'use strict'
module.exports = exports = async (ctx, next) => {

    ctx.updateEquip = (equip, count = 1)=>{
        const cfg = global.gameconfig.equipcomp[equip];
        const castitems = [];
        for (const cast of cfg) {
            const hasCount = ctx.role.getProp(cast.GSID);
            const castCount = cast.COUNT * count;
            if (hasCount < castCount){
                return null;
            }
            castitems.push({GSID: cast.GSID, COUNT: castCount});
        }
        ctx.role.castItemsNoSave(castitems);
        ctx.role.addItemsNoSave({gsid: parseInt(equip), count}, 'equip_comp');
        return castitems;
    }
    await next();
}
