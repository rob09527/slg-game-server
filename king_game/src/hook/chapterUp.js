/**
 * 征战结束事件
 */
module.exports = function () {
    const {REFRESH_INTERVAL_MIN} = global.gameconfig.eventdata;
    const ref_interval_ms = REFRESH_INTERVAL_MIN * 60 * 1000;
    const luckConfig = global.gameconfig.function_luck;

    // official_1_0
    //official_1_1
    // {"__verify":1590148616161,"data":{"items":[{"GSID":38005,"COUNT":25},
    // {"GSID":92001,"COUNT":1}],"castitems":[],"items_bymail":[]}}
    //  official_1_2
    //  official_1_3

    // 开启征战事件
    if (!this.role.mapevent.last
        && this.role[luckConfig.WORLD_EVENT.REQUIRE_NAME] >= luckConfig.WORLD_EVENT.REQUIRE_COUNT) {
        this.role.mapevent = {last: Date.now() - 3 * ref_interval_ms};
    }

}
