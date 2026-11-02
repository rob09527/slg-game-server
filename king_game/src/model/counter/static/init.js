'use strict';

/**
 * 初始化计数
 * @param type {string}
 * @param initial_value {number}
 * @return {number}
 */
module.exports = exports = async function (type, initial_value = 0) {
	const c = await this.findOneAndUpdate({
		type
	}, {
		$set: {
			count: initial_value
		}
	}, {
		upsert: true,
		new: true,
	});
    return c.count;
};
