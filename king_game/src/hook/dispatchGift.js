const khlog = require("../util/khlog");
const moment = require("moment");

let giftLevelGroup ;
/**
 * 触发推荐礼包分发
 * @param changeGsid {string|number}
 * @param change {number}
 * @param count {number}
 */
module.exports = async function (changeGsid,change, count) {
    const type = global.gameconfig.sppackrecommend.GIFT_TYPES[changeGsid];

    if (!type ) { // 没有对应的 type 或礼包 不给予操作
        return;
    }
    if (type.startsWith('XJYC')){ // 武将星级推荐礼包必须在指定关卡过后触发，写死
        if (this.role.maxmapid <= 11109 || this.role.level < 12){
            return;
        }
    }

    let giftLevel;
    if(!giftLevelGroup){ // 按照类型进行对应礼包类型的等级分组
        giftLevelGroup = {};
         Object.values(global.gameconfig.sppackrecommend.SPPACK).map(gifts => gifts[0]).forEach(gf => {
            giftLevelGroup[gf.TYPE] =giftLevelGroup[gf.TYPE] || [];
            giftLevelGroup[gf.TYPE].push(gf.LIMIT);
         });
        Object.values(giftLevelGroup).forEach(o => o.sort((a,b)=>b-a)); // 避免配置导致的 礼包的等级 乱序
    }
    let createTime = moment(this.role.create).startOf('days').valueOf();
    let nowTime = moment(Date.now()).startOf('days').valueOf();
    for(let gl of giftLevelGroup[type]){ //  当前标记 count 的对应礼包限制,从到小的取
        if(gl > count){
            continue;
        }
        let day = global.gameconfig.sppackrecommend.GIFT_DAYS[type] || 0;
        if(day > 0) {
            let endTime = createTime + (day-1) * 24 * 3600 * 1000;
            if (nowTime < endTime) {
                continue;
            }
        }

        giftLevel = gl;

        // 产品 要求， 推荐礼包改为可以跨条件触发，例如 15级 跳升到 30级，会触发 18级礼包+30级礼包,所以循环触发
        const giftType = `${type}${giftLevel}`;
        const gift = await this.dao.c_recommp_gift.triggerGift(this.role, giftType);

        if (gift){
            console.log(this.role.rno,'GET RECOM GITF :',giftType);
            this.body.global_gifts =  this.body.global_gifts || [];
            this.body.global_gifts.push(gift);
            // 礼包埋点-推荐礼包
            khlog.giftlog("tjlb", this.role, type, giftLevel, gift.price);

        } else {
            break;
        }
    }
};
