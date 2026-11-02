'use strict'

const {TICKETGSID,FREE_MARK,STATUS} = require('../../common/const');
//记忆比拼 信息查询
module.exports = exports = async (ctx, next) =>{
   
   
    ctx.assert(global.gameconfig.zhd.JYBP,'jybp config is not exits')

    const {MARK,CAST_TICKET = []} =  global.gameconfig.zhd.JYBP;
    ctx.assert(MARK,'jybp mark is not exits');
    ctx.assert(CAST_TICKET && Array.isArray(CAST_TICKET) && CAST_TICKET.length > 0,'jybp CAST_TICKET is not exits');
    let mark = MARK ;
    let titicgsid = CAST_TICKET[0]; 
    
    let ticketProp = ctx.role.getItems(titicgsid.GSID);
    let freeProp = ctx.role.getItems(mark);

   
    let minStep = ctx.role.jybp.minStep;
    let ret = {
        ticketCount:ticketProp.count,
        freeCount:freeProp.count,
        step:0,
        minStep:minStep
    }
    ctx.body = ret;
    
    
}