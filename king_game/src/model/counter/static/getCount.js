'use strict';

/**
 * 获取计数
 * @param type {string}
 * @return {number}
 */
module.exports = exports = async function (type) {
	const c = await this.findOneAndUpdate({
		type
	}, {
		$inc: {
			count: 1
		}
	}, {
		upsert: true,
		new: true,
	});
    return c.count;
};
