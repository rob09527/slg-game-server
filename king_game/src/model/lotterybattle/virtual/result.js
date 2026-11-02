
'use strict';

module.exports = exports = {
	get () {
		if (this._result && this._result.length > 0) return JSON.parse(this._result);
	},
	set ({result, videoid}) {
		this._result = JSON.stringify({result, videoid});
	}
}
