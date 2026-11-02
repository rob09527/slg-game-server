

const chapterUp = require('./chapterUp');
const lookStarPermium = require('./lookStarPermiumEnd');
const lookStar = require('./lookStarEnd');
const roleTagChange = require('./roleTagChange');
/**
 * 事件处理完成
 *  this === ctx;
 * @param eventId { string }
 * @param args {object}
 */
module.exports = function (eventId, ...args) {
    switch (eventId) {
        case EVENT_ENUM.CHAPTER_UP: // 占城成功
            return chapterUp.call(this,...args);
        case EVENT_ENUM.LOOKSTAR_PREMIUM: // 高级观星
            return lookStarPermium.call(this, ...args);
        case EVENT_ENUM.LOOKSTAR: // 普通观星
            return lookStar.call(this, ...args);
        case EVENT_ENUM.TAG_CHANGE: //  标志位 改变
            return roleTagChange.call(this, ...args);
    }
}
