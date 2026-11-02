
'use strict';

module.exports = exports = function () {
	return {
		servid: this.servid,
		groupid: this.groupid,
		name: this.name,
		create: this.create,
		start: this.start,
		status: this.status,
		area: this.area,
		room: this.room || 0,
		type: this.type || 0,
		serv: {
			id: this.sno,
			name: this.name
		}
	};
}
