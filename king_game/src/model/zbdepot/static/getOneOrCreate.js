
'use strict'

module.exports = async function ({ rid }) {
    let depot = await this.getOne({ rid });
    if (!depot) depot = await this.create({ rid });
    return depot;
}