
const moment = require('moment');
/**
 * 活动开启关闭时间
 * @param {*} rid 角色id
 * @param {*} gname  武将名称 
 * @returns 
 */
module.exports = async function (rid, gname = 'guanyu', prop) {
    
    let data = await this.findOne({rid, gname});
    if (!!data) {
        if (prop['93203'] > 0 && prop['93312'] > 2) {
            let over = global.gameconfig.generalstar.GIFT.find(({LIMIT}, index)=>{
                return (data.buylimit[index] || 0) < LIMIT;
            });
            if (!over) {
                return [0,0];
            }
        }
        return [data.create, data.expire];
    }
    else{
        const {DAYS,COND} = global.gameconfig.generalstar;
        // 是否有超过百级的武将
        let $in = await global.dao.general.getGsidsByParam({NAME: gname});
        let cond = {
            rid, 
            gsid: {$in},
        }
        let generalInfo = await global.dao.general.find(cond, {level: 1}).hint({rid:1}).sort({level: -1}).limit(1);
        if(generalInfo && generalInfo[0] && generalInfo[0].level >= +COND){
            data = await this.create({rid, gname, expire: moment().add(+DAYS, 'd').valueOf()});
            return [data.create, data.expire];
        }
    }

    return [0,0];
}