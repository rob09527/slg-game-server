
'use strict'
const _ = require('lodash')
module.exports = async ctx => {
    let {
        type: is_confirm,
        arr = [],
    } = ctx.request.body;
    is_confirm = +is_confirm;
    ctx.assert(arr.length > 0, 'no signet');
   
    let output = [];
    let deleteData = [];
    let cast = []
    for(let i = 0; i<arr.length;i++){
        let guid = arr[i];
        if(!guid) continue;
        guid = typeof guid === 'number' ? String(guid) : guid;
        let signet
        if(guid.length > 5){
            signet = await ctx.dao.signet.findOne({_id:guid,general:{$exists:false}},{gsid:1});
            ctx.assert(signet,'condition limit');
            deleteData.push(guid);
        }else{
            cast.push({
                GSID:guid,
                COUNT:1
            })
        }
        let gsid = signet ? signet.gsid : guid;
        let items = global.gameconfig.signet_roll_exchange[gsid];
        ctx.assert(items,'quality limit')
        items.forEach(it => {
           let ot = output.find((o)=> o.GSID == it.GSID);
           if(ot){
               ot.COUNT += it.COUNT;
           }else{
               let itd = _.cloneDeep(it);
               output.push(itd);
           }
       });
    }
    ctx.body = {
        items: output,
    }
    if (is_confirm) {
        if(cast.length > 0)   ctx.role.castItemsNoSave(cast);
        if(deleteData.length > 0)await ctx.dao.signet.deleteMany({_id:{$in:deleteData}});
        ctx.role.addItemsNoSave(output);
        await ctx.role.save();
    }
}