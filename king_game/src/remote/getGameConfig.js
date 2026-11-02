'use strict'

module.exports = async function (name) {
    return global.gameconfig[name]
}
