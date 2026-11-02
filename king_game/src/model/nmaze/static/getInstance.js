
'use strict'
/**
 * 获取 新版远征实例
 */
module.exports = async function (rid) {
    let maze = await this.findOne({rid});
    if (!maze) {
        maze = new this({rid})
    }
    return data;
}
