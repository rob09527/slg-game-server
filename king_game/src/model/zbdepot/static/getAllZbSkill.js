
'use strict'

module.exports = async function ({ rid }) {
    return await this.getOne({rid})
		.then(depot => depot? depot.getZhenbaoAll(): {zblist: []})
		.then(({zblist}) => zblist.map(one => one.info().skill).filter(Boolean))
}