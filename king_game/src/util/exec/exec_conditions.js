
'use strict';

const { isTime } = require("../weektarget");

module.exports = exports = {
	'-100': function (role, lteday) {
		let day = new Date(role.create).dayFromNow();
		return day <= lteday;
	},
	'-101': function (role, num) {
		const avaliable = role.bagspace - role.gnum;
		return avaliable >= num;
	},
	'-102': function (role, mapid) {
		return role.maxmapid >= mapid;
	},
	'-103': function (role, level) {
		return role.level >= level;
	},
	'-104': function (role, tower) {
		return role.tower >= tower;
	},
	'-105': function (role, vip) {
		return role.vip >= vip;
	},
	'-106': function (role, gteday) {
		let day = new Date(role.firstcharge || 1).dayFromNow();
		return day >= gteday;
	},
	'-107': function (role) {
		return !!role.legion;
	},
	'-108': function (role, chapterIndex) {
		let {
			dgtop: {
				pass: maxchapter = 0,
			}
		} = role;
		return maxchapter >= chapterIndex - 1;
	},
	'-109': function (role, lteday) {
		let day = new Date(role.create).dayFromNow();
		return day > lteday;
	},
	// 暂支持成长基金、试练塔基金
	'-110': function (role, type) {
		let {
			special
		 } = role;
		return special[`${type ? type : "cz"}`] > 0;
	},
	"-111": function(role) {
		return isTime(role);
	},
	"-112": function(role, tutor) {
		return role.tutor === Number.parseInt(tutor);
	},
}