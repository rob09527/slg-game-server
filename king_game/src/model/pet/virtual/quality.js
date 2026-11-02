

/**
 * 计算灵魂绑定的属性
 * @type {exports}
 */
module.exports = exports = function () {
    const config = global.gameconfig.petitem[this.gsid];
    return config && config.QUALITY;
};
