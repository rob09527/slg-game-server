
'use strict'

/**
 * 返回一个珍宝
 * @param {Number} zbid 
 * @returns 
 */

module.exports = async function({zbid}) {
    const {zblist} = await this.addZhenbao({zbidList: zbid});
    return {
        zhenbao: zblist[0]
    };
}