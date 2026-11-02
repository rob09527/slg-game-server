'use strict'

const { isNull, isUndefined } = require('lodash');
const {TICKETGSID,FREE_MARK,MEM_FREEGSID,STATUS,GAMESTATUS} = require('../../common/const');

//记忆比拼 完成
module.exports = exports = async (ctx, next) =>{

    ctx.assert(ctx.request.body.params, 'invalid params');
    let {rememberid} = ctx.request.body.params;
    //校验rememberid 防止重复刷 以及不存在的游戏
    ctx.assert(rememberid == ctx.role.jybp.rememberid, 'invalid rememberid');
    

    let {step,state} = ctx.request.body.params;
    ctx.assert(!isNull(step), 'invalid step');
    ctx.assert(step >= 0, 'invalid step');
    if(state == GAMESTATUS.GAMEEND)     ctx.assert( step > 0, 'invalid step');
    ctx.assert(global.gameconfig.zhd.JYBP,'jybp config is not exits')
    const {MARK,FREECHANCE,CAST_TICKET=[]} =  global.gameconfig.zhd.JYBP;
    ctx.assert(FREECHANCE,'jybp FREECHANCE is not exits')
    ctx.assert(MARK,'jybp mark is not exits')
    ctx.assert(CAST_TICKET && Array.isArray(CAST_TICKET) && CAST_TICKET.length > 0,'jybp CAST_TICKET is not exits');
    let mark = MARK ;

    let titicgsid = CAST_TICKET[0]; 

    let freeProp = ctx.role.getItems(mark);
    let propGSID = {
        GSID:mark,
        COUNT:FREECHANCE
    };
    let status = STATUS.FREE; 
    //免费次数不足则消耗道具
    if(freeProp.count < propGSID.COUNT){
        status = STATUS.PAY;
        propGSID = titicgsid;
    }
    ctx.role.castItemsNoSave([propGSID]);
    let castTicket = status == STATUS.FREE?0:propGSID.COUNT;

    let reaward = [];
    let {
        REAWARD_ITEMS = [],
    } = global.gameconfig.zhd.JYBP;
    //游戏完成可以获得奖励
    if(state == GAMESTATUS.GAMEEND){
        //判断步数在哪个区间 获得奖励
        for (let index = 0; index < REAWARD_ITEMS.length; index++) {
            const reward = REAWARD_ITEMS[index];
            if(step > reward.MINNUM && step <= reward.NUM){
                reaward.push({
                    gsid:reward.GSID,
                    count:reward.COUNT
                });
            }
        }
        let minStep = ctx.role.jybp.minStep;
        if(minStep > step || !minStep){
            ctx.role.jybp.minStep = step;
        }
        
    }
    //未获得奖励 则给予默认奖励
    if(reaward.length == 0){
        let defaultAward = REAWARD_ITEMS.sort((a,b)=>b.MINNUM-a.MINNUM)[0];
        reaward.push({
            gsid:defaultAward.GSID,
            count:defaultAward.COUNT
        });
    }

    if(reaward.length > 0){
        ctx.role.addItemsNoSave(reaward);
    }
    ctx.role.jybp.rememberid = 0;
    ctx.role.markModified('jybp');
    await ctx.role.save();

   

    let ticketProp = ctx.role.getItems(titicgsid.GSID);
    freeProp = ctx.role.getItems(mark);
    

    const minStep = ctx.role.jybp.minStep || 0;
    let ret = {
        state,
        ticketCount:ticketProp.count,
        freeCount:freeProp.count,
        minStep,
        step:0,
        result:{
            reaward,
            step
        }
    };
    ctx.body = ret;

   
    
}