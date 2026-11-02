
/*
	后台配置变量
 */

'use strict'

module.exports = exports = {
	// 自动开服:1=自动,2=手动
	auto_open: {type: Number, default: 2},
	// 自动开服时有效:数量+后缀名
	auto_name: {type: String, default: '服'},
	// 自动开服人数
	auto_num: {type: Number, default: 1000},
	// 自动开服付费人数
	auto_pay: {type: Number, default: 100},	
	// 人满创角:1=能,2=不能
	auto_create: {type: Number, default: 1},
	// 新登录服类型:1=不跳转,2=审核服跳转,3=正式服跳转
	type_url: {type: Number, default: 1},
	// 新登录服地址
	new_url: {type: String, default: ''},
	// 聊天过滤
	chat_filter: {type: String, default: ''},
}	