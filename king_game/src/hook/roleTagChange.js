const dispatchGift = require('./dispatchGift');
// const houseLampNotify = require('./houseLampNotify');
const dispatchTimeplay = require('./dispatchTimeplay');
const tagsChangeOtherEvent = require('./tagsChangeOtherEvent');
/**
 * gsid 改变, 内部处理逻辑不需要 单独 this.role.save(); return true  即可
 * @param gsid {number| string} GSID
 * @param change {number} 改变的数量
 * @param count {number} 改变后的数量
 */
module.exports = async function (gsid, change, count) {
    console.log('GSID_CHANGE', this.role.rno, 'GSID', gsid, 'CHANGED', change, 'NOW IS', count);
    // houseLampNotify.call(this, gsid, count).catch(console.error); // 全服跑马灯通知
    await dispatchTimeplay.call(this, gsid, change, count).catch(console.error);
    tagsChangeOtherEvent.call(this, gsid, change, count).catch(console.error); // 一些特殊的标记触发监听
    return dispatchGift.call(this, gsid, change, count); // 触发推荐礼包
};
let LISTEN_TAG;

Object.defineProperty(module.exports, 'LISTEN_TAG', {
    get() {
        if (LISTEN_TAG) {
            return LISTEN_TAG;
        }
        // 默认监听推荐礼包的触发GSID 新增了跑马灯推送的触发字段监听
        // LISTEN_TAG = Object.keys(global.gameconfig.sppackrecommend.GIFT_TYPES).concat(Object.keys(global.gameconfig.horse_race_lamp));
        LISTEN_TAG = Object.keys(global.gameconfig.sppackrecommend.GIFT_TYPES);

        // 注册需要监听的 标志位,
        // LISTEN_TAG.push(90123) // 这里PUSH需要新增的GSID监听，也可以设置属性监听 例如 level
        LISTEN_TAG.push('pvpscore'); // 监听 单人演武积分
        LISTEN_TAG.push(38004);

        return LISTEN_TAG;
    }
})

