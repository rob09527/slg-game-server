'use strict'
/**
 * 红色定制 0//橙色 1 红色
 * @param {} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    let {
        camp,//阵营
        occu,// 职业
        gsid//武将
    } = ctx.request.body;
    let output = [];
    let type = 0;
    let gsids = [];
    if(gsid){//红色定制
        type = 1;
        gsid = String(gsid);
        let general = global.gameconfig.general[gsid];
        ctx.assert(general,'general not exists');
        let name = general.NAME;
        for (const key in global.gameconfig.general) {
            if (Object.hasOwnProperty.call(global.gameconfig.general, key)) {
                if(global.gameconfig.general[key].NAME == name){
                    gsids.push(key)
                };
            };
        };
        let sg_conf = gsids.some((g)=>{
            return global.gameconfig.signet_general[g];
        });
        ctx.assert(sg_conf,'general not signet');
    }else{
        ctx.assert(camp >= 1 && camp <= 6,'camp is no exists');
        ctx.assert(occu >= 1 && occu <= 6,'occu is no exists');
    }
    let {
        CAST: _CAST,
    } = global.gameconfig.signet_custom_cast[type];
    ctx.role.castItemsNoSave(_CAST);        
    let pool = global.gameconfig.signet_roll_pool.filter((s)=>{
        let signet = global.gameconfig.signet[s.GSID];
        let quality = type == 0 ? 5 : 6;
        return signet.QUALITY == quality;
    });
    if(type == 1){
        let signets = await global.dao.signet.find({rid:ctx.role.i()},{gsid:1,general:1,prop:1});
        signets = signets.filter((s)=>{
            let s_conf = global.gameconfig.signet[s.gsid];
            return s_conf.QUALITY == 6;
        });
        let arr = [];
        for (let i = 0; i < signets.length; i++) {
            const s = signets[i];
            if(s.prop && s.prop.gsid){
                if(gsids.includes(String(s.prop.gsid))){
                    arr.push(s);
                };
            }
        }
        signets = arr;
        let types = [];
        for (let index = 0; index < 8; index++) {
            let st = signets.find((s)=>{
                return s.gsid % 10 == index;
            });
            if(!st) types.push(index)
        }
        if(types.length > 0){
            let temp = pool.filter((p)=>{
               let real = types.find((t)=> t == p.GSID % 10);
               if(real == 0) real = 1;
                return real;
            });
            if(temp.length > 0 ) pool = temp;
        }
    }
    let rates = pool.deepMap('W');
    let index = ctx.random.inweight(rates);
    let item = pool[index];
    output.push({GSID:item.GSID,COUNT:1});
    if(type == 0){
        ctx.role.addItemsNoSave(output,{main:'signet',sec:{camp,occu}});
    }else{
        ctx.role.addItemsNoSave(output,{main:'signet',sec:{gsid}});
    }
    await ctx.role.save();
    ctx.body = {
        items: ctx.role.newsignet.map((s)=>{
            return s.base();
        })
    }
}