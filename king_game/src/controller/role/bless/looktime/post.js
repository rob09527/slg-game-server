'use strict'

module.exports = exports = async (ctx, next)=>{
    let {dropid:DROPID} = ctx.request.body;
    let boxInfo = ctx.config.BOX.find(doc =>{
        return doc.DROPID == DROPID;
    })
    let type = DROPID == 1006 ? "manor" : "legion";
    ctx.body = {
        time: ctx.role.bless[type] ? ctx.role.bless[type] + boxInfo.TIME * 60000 : 0
    };
}