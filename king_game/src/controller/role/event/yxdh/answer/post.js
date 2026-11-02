'use strict'
// 元宵灯会 --- 答题
module.exports = exports = async function (ctx) {
    let {index,answer,day} = ctx.request.body;
    ctx.assert(index >= 0 && index<= 4,'invalid index');
    ctx.assert(answer >= 0 ,'invalid answer');
    ctx.assert(day >= 1 ,'invalid day');
    ctx.assert(ctx.role.yxdh[index] == 0,'invalid statu');

    const labterns = ctx.config;
    ctx.assert(labterns && labterns.length > 0,'invalid labternsConfig');

    let curDayLabtern = labterns.filter((l)=> l.DAY == day)[index];
    ctx.assert(curDayLabtern,'invalid labternsConfig');
    
    let status = 0;
    let items = curDayLabtern.WRONG_AWARD;

    if(curDayLabtern.CONTENT[answer] == curDayLabtern.ANSWER0){
        status = 1;
        items = curDayLabtern.RIGHT_AWARD;
    }

    ctx.role.addItemsNoSave(items);

    ctx.role.yxdh[index] = 1;

    ctx.role.markModified('yxdh');

    await ctx.role.save();
    ctx.zhdpoint("YXDH_RED", ctx.role);

    ctx.body = {items,status,index};

}