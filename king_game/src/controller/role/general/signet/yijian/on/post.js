/**
 * 一键上印记
 * 
 */
 'use strict';

 module.exports = exports = async (ctx, next) => {
    
    //先全部脱下印记
    const guid = ctx.general._id.toString();
    await ctx.dao.signet.updateMany({
        _id: {$in: ctx.general.signet},
    }, {$unset: {general: 1}});

    /**
     * 基本条件： 1 没有装备
     *          2 阵营 职业 武将 至少有一种符合
     * 排序规则，优先按照品质来排 紫、橙、红 由低到高,
     *          品质相同按照符合条件数量来排
     *          以上两个规则相同则按照印记gsid排序
     */
    const general_conf = global.gameconfig.general[ctx.general.gsid];
    //判断条件是否满足
    let name = general_conf.NAME;
    let gsids = []    
    let or = [{'prop.camp':general_conf.CAMP},{'prop.occu':general_conf.OCCU}];
    if(general_conf.OCCU2) or.push({'prop.occu':general_conf.OCCU2})
    for (const key in global.gameconfig.general) {
        if (Object.hasOwnProperty.call(global.gameconfig.general, key)) {
            if(global.gameconfig.general[key].NAME == name){
                or.push({'prop.gsid':key});
                gsids.push(key)
            };
        };
    };
    let cod ={
        rid: ctx.role.i(),
        general: {$exists: false},
        $or:or
    }
    //过滤掉不符合基本条件的印记先
    let signets = await ctx.dao.signet.find(cod, {});
    //如果没有符合条件的印记则不进行下一步
    if (signets.length === 0) return;
    let has = {};
    let conf_fun = function(prop){
        let weight = 0;
        if(prop["camp"] && prop["camp"] == general_conf.CAMP)  weight ++;
        if(prop["occu"] && prop["occu"] == general_conf.OCCU) weight ++;
        if(prop["occu"] && prop["occu"] == general_conf.OCCU2) weight ++;
        if(prop["gsid"] ){
            let sg_conf = gsids.some((g)=>{
                return prop["gsid"] == g;
            });
            if(sg_conf) weight ++
        } ;
        return weight;
    }
    //先去重,优先按照印记类型降序,排除印记类型相处的情况,优先去除低品质的的,已经鉴定的要排在未鉴定的前面,已经鉴定的一定是高品质
    signets = signets.sort((a,b)=>{
        let as_conf = global.gameconfig.signet[a.gsid];
        let bs_conf = global.gameconfig.signet[b.gsid];
        if(bs_conf.TYPE == as_conf.TYPE){
            let aw = conf_fun(a.prop);
            let bw = conf_fun(b.prop);
            if(bw == aw){
                if(bs_conf.QUALITY==as_conf.QUALITY){
                    let at = a.appraise ? 1 : 0;
                    let bt = b.appraise ? 1 : 0;
                    return bt -at;
                }else{
                    return bs_conf.QUALITY-as_conf.QUALITY;
                };
            }else{
                return bw - aw;
            }
        }else{
            return bs_conf.TYPE - as_conf.TYPE;
        };
    })
    .filter(s => {
        let signet_conf = global.gameconfig.signet[s.gsid];
        return has[signet_conf.TYPE] ? false : has[signet_conf.TYPE] = 1;
    });
    // 先按阴阳降序排序,保证前八个必有阴阳属性 ,后面再看有没有没属性排序啥的
    //有阴阳必定是最高品质, 后面在按品质高低排序,
    signets.sort((a,b)=>{
        let as_conf = global.gameconfig.signet[a.gsid];
        let bs_conf = global.gameconfig.signet[b.gsid];
        let aw = conf_fun(a.prop);
        let bw = conf_fun(b.prop);
        if(bw == aw){
            if(bs_conf.QUALITY==as_conf.QUALITY){
                let at = a.appraise ?  a.appraise.type : 0;
                let bt = b.appraise ?  b.appraise.type : 0;
                return bt -at;
            }else{
                return bs_conf.QUALITY-as_conf.QUALITY;
            };
        }else{
            return bw - aw;
        };
    });
    ctx.general.signet = [];
    ctx.general._signet_ = [];

    //挑选前八个
    for (let i = 0; i < 8; i++) {
        let s = signets[i];
        if(!s) continue;
        let index = s.gsid % 10;
        ctx.general.signet[index] = s._id.toString();
        ctx.general._signet_[index] = await s.base();
    }
    await ctx.dao.signet.updateMany({_id: {$in: ctx.general.signet }}, {$set: {general: guid}});
 };