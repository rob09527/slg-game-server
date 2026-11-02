'use strict'

module.exports = exports = function () {
    try {
        if (this.expand) {
            // 判断是否是json格式
            let expand = JSON.parse(this.expand);
            return expand;
        }

    } catch (error) {
        console.error(`ZHD_${this.type}_EXPAND 解析错误,非JSON格式`, error);
    }
    return {}
}
