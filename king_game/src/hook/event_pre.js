/**
 * this === ctx;
 * 事件处理开始之前
 * @param eventId { string }
 * @param execId {string} // 兑换规则事件分发
 */
module.exports = function (eventId, execId = undefined) {
    if (execId) {
        if (execId.startsWith('sevenlogin_')) {
            eventId = EVENT_ENUM.SEVEN_LOGIN; // 七天签到
        } else { // 其他兑换规则不用事件处理
            return;
        }
    }
    const luckConfig = global.gameconfig.function_luck[eventId];
    if (!luckConfig) {
        return;
    }
    this.assert(this.role.getProp(luckConfig.REQUIRE_NAME) >= luckConfig.REQUIRE_COUNT, 'function lock');

};
