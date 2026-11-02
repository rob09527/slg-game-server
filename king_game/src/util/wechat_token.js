'use strict'
const psend = require('./psend');
module.exports = async function (game_id = 0, access_token = '') {
    return await psend('/sys/serv/wechat/token', {game_id, access_token})
}
