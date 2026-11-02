
'use strict'

module.exports = async function ({ rid }) {
    let depot = await this.findOne({ rid });
    return depot;
}