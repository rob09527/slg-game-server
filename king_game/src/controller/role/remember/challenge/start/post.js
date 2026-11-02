'use strict'

const {TICKETGSID,FREE_MARK,MEM_FREEGSID,STATUS} = require('../../common/const');
//记忆比拼 开始游戏
module.exports = exports = async (ctx, next) =>{
    
    ctx.assert(global.gameconfig.zhd.JYBP,'jybp config is not exits')

    const {MARK,FREECHANCE,CAST_TICKET=[]} =  global.gameconfig.zhd.JYBP;
    ctx.assert(MARK,'jybp mark is not exits')
    ctx.assert(FREECHANCE,'jybp FREECHANCE is not exits')

    let mark = MARK ;
    ctx.assert(CAST_TICKET && Array.isArray(CAST_TICKET) && CAST_TICKET.length > 0,'jybp CAST_TICKET is not exits');
            
    let titicgsid = CAST_TICKET[0];  
    let freeProp = ctx.role.getItems(mark);
    let ticketProp;
    //免费次数不足则消耗道具
    if(freeProp.count < FREECHANCE){
        ticketProp = ctx.role.getItems(titicgsid.GSID);
        ctx.assert(ticketProp.count >= titicgsid.COUNT,'tickets is not enough');
    }
    //生成游戏ID
    let rememberid = Date.now();
    ctx.role.jybp.rememberid = rememberid;
    ctx.role.markModified('jybp');
    await ctx.role.save();
    //生成2个0-5的12位长度的数组 
    let cardList = Array.from({length:12},(v,k)=>{
        k++;
        let ki = k  %6;
        if(k > 0 && ki == 0) ki = 6;
        return ki-1;
    });
    //打乱数组
    cardList = shuffle(cardList);

    let ret = {
        cardList,
        rememberid:rememberid
    }
    ctx.body = ret;
   
    
}
function shuffle(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        let itemAtIndex = arr[randomIndex];
        arr[randomIndex] = arr[i];
        arr[i] = itemAtIndex;
    }
    return arr;
}