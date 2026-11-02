'use strict';

/**
 * 是否被封号
 * @return {Proxy<{ host: string, port: number,token: string }>}
 */
module.exports = exports = async function (uid) {
    const ban = await this.findOne({uid});
    return ban && ban.expired > Date.now();
}
