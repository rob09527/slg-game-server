
'use strict'
// 精确搜索玩家
module.exports = exports = async function (ctx, next) {
    let strany = ctx.request.body.strany;// 好友rno或者rname 等于这个值

    let returnData = [];
    let selectArr = [];
    let obj = {};
    let defaultMatch = {
        servid: {
            $in: ctx.role._gameserv.group_sid_list
        }
    };
    let arrInfo = await ctx.dao.role.find({ "rname": strany, ...defaultMatch });
    selectArr.append(arrInfo);

    try {
        let reg = new RegExp("^[0-9]*$");
        if (reg.test(strany)) {
            let arrInfo2 = await ctx.dao.role.find({ 'rno': strany, ...defaultMatch });
            selectArr.append(arrInfo2);
        }

    } catch (error) {

    }

    for (let arr of selectArr) {
        obj = {};
        obj.iconid = arr.iconid;
        obj.headid = arr.headid;
        obj.frameid = arr.frameid;
        obj.rname = arr.name;
        obj.vip = arr.vip;
        obj.level = arr.level;
        obj.lasttime = arr.update;
        obj.id = arr.i();
        obj.set = arr.set;
        obj.power = arr._power;
        let legion = await ctx.dao.legion.findOne({_id: arr.legion}, { name: 1});
        if(legion) obj.legion = { id: arr.legion, name: legion.name };
        returnData.push(obj);
    }

    ctx.body = returnData;
}
