

/**
 * 计算灵魂绑定的属性
 * @type {exports}
 */
module.exports = exports = function () {
    const config = global.gameconfig.general[this.gsid];
    return config && config.STAR;
};
