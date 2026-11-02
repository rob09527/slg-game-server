'use strict'
const moment = require('moment');
const {isValidObjectId} = require('mongoose');

module.exports = exports = async (ctx, next) => {
    ctx.body = {
        code : 0,
        msg : "success",
        data : [
            {
                gift_status : "0"
            }
        ]
    }

    let {
        sign,
        gift_code,
        user_id,
        role_id,
        server_id
    } = ctx.request.query;
    ctx.assert(ctx.h5postfn(ctx.request.query) === sign, 'VERIFYFAIL'); // 签名验证

    const servid = Number(server_id);
    const uid = ctx.channel + user_id;
    let con = {};
    if(isValidObjectId(role_id)){
        con._id = role_id;
    }
    else{
        con.rno = +role_id;
    }
    const game = Object.values(global.gameservs)[0]; // 取一个游戏实例
    const role = await game.remote.findRoles(con);
    if(!role) { // 角色不存在
        ctx.body.msg = "role nexist"
        return;
    }
    if(role.uid != uid){
        ctx.body.msg = "uid error"
        return;
    }
    const one = await ctx.dao.cdkey.findOne({key: gift_code});
    if(!one){ // 不存在
        ctx.body.msg = "cdkey nexist"
        return;
    }
    if(one.pause){ // 暂停使用
        ctx.body.msg = "cdkey pause"
        return;
    }
    if(one.start >= Date.now()){ // 尚未开始
        ctx.body.msg = "before start"
        return;
    }
    if(one.end <= Date.now()){ // 已过期
        ctx.body.msg = "after expire"
        return;
    }
    if (one.remain == 0){	// 次数用尽
        ctx.body.msg = "cdkey runout"
        return;
    }
    // if(one.bundles && !one.bundles.includes(bundle)){ // 包名限制
    //     ctx.body.msg = "bundle forbit"
    //     return;
    // }
    if (one.channel || one.channels) { // 渠道不可用
        let keyChannels = one.channels || [one.channel];
        if(!keyChannels.includes(ctx.channel)){
            ctx.body.msg = "bundle forbit"
            return;
        }
    }
    if (one.servid || one.servids) { // 服务器不可用
        let keyServids = one.servids || [one.servid];
        if(!keyServids.includes(servid)){
            ctx.body.msg = "server forbit"
            return; 
        }
    }

    if (one.level) {    // 等级限制
        if(role.level < one.level) {
            ctx.body.msg = "level forbit"
            return; 
        }
    }
    // verify
    let {items, name, limit} = one;
    let use_times = role.cdkeys[name] || 0;
    if(limit <= use_times){
        ctx.body.msg = "no more"
        ctx.body.data[0].gift_status = "2";
        return; 
    }
    if(!items || items.length == 0){
        ctx.body.msg = "invalid items"
        return; 
    }
    // confirm 
       
    let now = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`CDKEYUSE ${uid} ${servid} ${role.id} ${gift_code} ${now}`);

    await global.remote.agent_cdkey_items({_id: role.id}, name, use_times, items);

    const cond = {
        key: gift_code,
        remain: {
            $gte: 1,	// 剩余次数大于1
        }
    }
    const udp = {
        $inc: {
            remain: -1,	// 次数减少1
        }
    }
    await global.dao.cdkey.findOneAndUpdate(cond, udp);

    ctx.body.data[0].gift_status = "1";
}
