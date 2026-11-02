const khlog = require('../util/khlog');

let EVENT_GROUP = null;
/**
 * 触发限时玩法
 * @param changeGsid {string|number}
 * @param change {number} 改变的数值
 * @param count {number} 改变过后的数值
 */
module.exports = async function (changeGsid, change ,count) {

    if (!EVENT_GROUP) {
        EVENT_GROUP = {};
        global.gameconfig.chapter_new_event.EVENT_LIST.forEach(item => {
            EVENT_GROUP[item.TOUCH_KEY] = EVENT_GROUP[item.TOUCH_KEY] || [];
            EVENT_GROUP[item.TOUCH_KEY].push(item);
        });
    }
    const EVENTS = EVENT_GROUP[changeGsid];
    if (!EVENTS) { // 不相关的触发忽略
        return;
    }
    const oldCount = count - change; // 之前的数值

    const TOUCH = EVENTS.filter(one => one.TOUCH_NUM <= count && one.TOUCH_NUM > oldCount);
    if (TOUCH.length === 0){
        return;
    }
    const rid = this.role.i();
    // 拿到已经触发的 事件
    const has =  await this.dao.timeplay.find({ rid, index: {$in: TOUCH.map(t => t.ID) } }, {index: 1});
    const hasObj = {};
    has.forEach(h => hasObj[h.index] = 1);

    // 拿到需要触发的事件
    const NEED_TOUCH = TOUCH.filter(one => !hasObj[one.ID]);

    if (NEED_TOUCH.length === 0){
        return;
    }
    const now = Date.now();
    const touchEvent = await this.dao.timeplay.create( NEED_TOUCH.map(one => {
        return {
            index: one.ID,
            rid,
            create: now,
            etime: now + one.EXPIRE * 60 * 1000,
            task: {},
            exchange: {}
        }
    }) );
    this.body.touch_event = touchEvent;
};
