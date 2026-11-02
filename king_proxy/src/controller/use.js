'use strict'

const SIMULATOR_SERV_LIMT_DAY = 2;
const SIMULATOR_SERV_LIMT = SIMULATOR_SERV_LIMT_DAY * 24 * 60 * 60 * 1000;

module.exports = exports = async function (ctx, next) {
    await next();
}
