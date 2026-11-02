/**
 * 
 * 迎春筹办---大奖预览
 *  
 * 前段请求一次即可  随后访问本地缓存 退出游戏后在清除缓存
 * */ 
module.exports = exports = async (ctx) => {
    
    let {FINAL_REAWARD:finalReaward} = ctx.config;
    ctx.assert(finalReaward && finalReaward.length > 0,"invalid task config");
    let finalInfo = finalReaward.map((f)=>{
        return {
            limit:f.LIMIT,
            intro:f.INTRO,
            items:f.ITEMS,
        }
    });
   
    ctx.body = {
        finalInfo
    }
}