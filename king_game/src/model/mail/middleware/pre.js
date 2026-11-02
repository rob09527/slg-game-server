
'use strict'

module.exports = exports = {
	save: async function (next) {
		if (this.isNew) this.received = true;
	},
}
