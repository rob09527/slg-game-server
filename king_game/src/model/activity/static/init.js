'use strict';

/**
 * 初始化 活动
 */
module.exports = exports = async function () {
    const activities = await this.find({});
    const activity = {};
    for (const a of activities) {
        const type = a.type.toLowerCase();
        activity[type] = a;
    }
    return activity;
};
