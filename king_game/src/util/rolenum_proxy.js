'use strict'
const psend = require('./psend');
module.exports = async function (servid) {
    return await psend('/sys/serv/role', {
        servid: servid
    })
}
