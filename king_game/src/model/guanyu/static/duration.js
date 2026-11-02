const moment = require('moment')
/**
 * 活动开启关闭时间
 * @param {*} rid 角色id
 * @param {*} hcharge_num  历史充值数,90222的数量
 * @returns 
 */
module.exports = async function (rid, hcharge_num = 0) {
    if (hcharge_num > 0){
        let data = await this.findOne({rid});
        if(!data){
            const {DAYS} = global.gameconfig.guanyu;
            // 尝试获取最高等级&星级的关羽
            let $in = global.dao.guanyu.gsidList();
            let cond = {
                rid, 
                gsid: {$in},
            }
            let guanyu = await global.dao.general.find(cond, {level:1, gsid:1}).hint({rid:1}).sort({level: -1, gsid: -1}).limit(1);
            data = await this.create({rid, level: (guanyu&&guanyu[0]&&guanyu[0].level)||0, expireAt: moment().add(+DAYS, 'd').valueOf()});
        }
        return [data.create, data.expireAt];
    }
    return [0, 0];
}