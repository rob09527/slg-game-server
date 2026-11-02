
'use strict'

const { Schema } = require('mongoose');

const {
	ROLE_DEFAULT_IMAGEID = 52040,
	ROLE_DEFAULT_HEADID = 50076,
} = global.gameconfig.others;

module.exports = exports = {
	uid: { type: String, require: true },
	fid: { type: String },//sdk id
	// 角色创建时使用的渠道
	channel: { type: String },
	// 包名
	bundle: { type: String, default: 'default' },
	// 角色创建时登陆的平台
	platform: { type: String },
	// 是否模拟器(仅在安卓平台时出现)
	simulator: { type: Boolean },
	// 设备类型
	phonetype: { type: String },
	// 设备ID
	deviceid: { type: String },

	servid: { type: Number, require: true },
	rno: { type: Number, require: true, unique: true, min: 1200011, max: 8899999 },

	rname: { type: String, sparse: true, minlength: 1 },	//todo: 长度限制?特殊字符验证?
	mood: { type: String, sparse: true, maxlength: 64 }, // 用户签名(心情语)
	sex: { type: Number, min: 0, max: 1, default: 0 },
	autodecomp: Number, // 是否开启自动遣散武将,默认 false

	iconid: { type: Number, default: 10261 }, // 即将作废
	// 装饰系统-头像列表
	_heads: { type: Schema.Types.Mixed, default: { 50009: -1 } },
	// 正在使用的头像
	headid: { type: Number, default: ROLE_DEFAULT_HEADID },
	// 形象列表
	_images: { type: Schema.Types.Mixed, default: { 52029: -1 } },
	// 正在使用的形象id
	imageid: { type: Number, default: ROLE_DEFAULT_IMAGEID },
	// 头像框
	_frames: { type: Schema.Types.Mixed, default: { 51001: -1 } },
	// 皮肤列表
	_skins: { type: Schema.Types.Mixed, default: {} },
	//秘境 
	secretRealm: { type: Schema.Types.Mixed, default: {} },
	// 正在使用的头像框id
	frameid: { type: Number, default: 51001 },


	tutor: { type: Number, default: 2 },	// 导师 1战士 2刺客 3法师 4射手

	// 征战地图下标
	_maxmapid: { type: Number, default: 0 },
	//是否打完最后一关 false没有 tru
	mapfinished: { type: Boolean, default: false },
	chaperupdate: { type: Number, default: Date.now },
	lastreap: { type: Number, default: Date.now },
	lastgain: { type: Number, default: Date.now },
	/**
	 * 以下为道具类型字段,内存储道具信息,例如
	 * 其他分类可见src/model/role/common/type.js
	 * hide -> 隐藏道具
	 * props -> 基本道具
	 * others -> 标记道具
	 * zbpiece -> 珍宝碎片
	 *
	 * hide: {
	 * 	38001: {
	 * 		count: 100,
	 * 	}
	 * },
	 * props: {
	 * 	30001: {
	 * 		count: 1,
	 * 	}
	 * }
	 */
	hide: { type: Schema.Types.Mixed, default: {} },
	props: { type: Schema.Types.Mixed, default: {} },
	others: { type: Schema.Types.Mixed, default: {} },
	castlimit: { type: Schema.Types.Mixed, default: {} },
	zbpiece: { type: Schema.Types.Mixed, default: {} },

	cdkeys: { type: Schema.Types.Mixed, default: {} },

	battlearr: { type: Schema.Types.Mixed, default: {} },
	/**
	 * 神兽-mythical
	 *  "102": {
			"level": 100, // 神兽等级
			"class": 4, //神兽阶级
			"pskill": [
				30, //第一个技能等级
				30,
				30,
				30
			],
			"talent":[
				{
					"pro":100
				},
				{}
				...

			],
			"talentskill":[10001,10002] // 天赋技能
		}
	 *
	 */
	mythical: { type: Schema.Types.Mixed, default: {} },

	tower: { type: Number, default: 0 },
	_towertoken: {
		last: { type: Number, default: Date.now },
		num: { type: Number, default: 10 },
	},

	_power: { type: Number, default: 0 },
	_powerbattleset: { type: Schema.Types.Mixed, default: {} },

	pvpscore: { type: Number, default: 1000 },
	pvpupdate: { type: Number, default: Date.now },
	pvpwinchain: { type: Number },	// 连胜次数

	recruitfree: {
		normal: { type: Number, default: 1111111111111 },
		premium: { type: Number, default: 1111111111111 },
	},

	gnum: { type: Number, default: 0 },
	petnum: { type: Number, default: 0 },
	horsenum: { type: Number, default: 0 },

	special: {
		type: Object,
		default: {}
		// // 霸王特权,时间戳,例: 1591781568719
		// bw: {type: Number, default: 0},
		// // 勤政特权,时间戳
		// qz: {type: Number, default: 0},
		// zx: {type: Number, default: 0},
		// lm: {type: Number, default: 0},
		// // 月度礼包,是否存在,例: 1
		// yd: {type: Number, default: 0},


		// gz: {type: Number, default: 0},
		// zz: {type: Number, default: 0},
		// 多段位成长基金
		// cz: {type: Number, default: 0},
		// cz1: {type: Number, default: 0}, ...
		// 多段位 试练塔基金购过期时间，为0则没买过
		// tower: {type: Number, default: 0},
		// tower1: {type: Number, default: 0},
	},

	friends: [],

	gain_cache: [],

	online: { type: Number },

	// 首充的时间点
	firstcharge: { type: Number },

	ssppack: { level: [], gstar: [] },
	pflb: [], // 皮肤礼包
	czlb: [],
	cplb: [],//寻宝礼包
	cplb2: [],//寻宝礼包
	cclb: [],//传承礼包
	xsdh: [],
	jrlb1: [],
	jrlb2: [],
	gxlb: [],
	szhc: [],
	gjlb: [],
	smbx: [],// 周活动-神秘宝箱
	cjxg1: [],// 春节vip限购1
	cjxg2: [],// 春节限购2
	cjxg3: [],// 弹窗礼包3
	gjdl: [],// 挂机掉落
	hqsd: [],// 欢庆商店
	gzlb: [],// 高招周礼包
	sbjl: [],// 神兵降临
	wjzh: [],// 武将组合
	wjcs: [],// 武将重生
	thlb: [],// 特惠礼包
	dwlb: [],// 端午礼包
	jhlb: [],// 钜惠礼包
	jhlb1: [],// 钜惠礼包
	swlb: [],// 神威礼包
	swlb1: [],// 神威礼包
	wzqd: [],// 万众期待-宝箱进度领取标记
	jfbx: [], // 积分宝箱
	hyhl: [], // 活跃豪礼
	hyhl1: [], // 活跃豪礼1
	zylb: [], // 职业礼包，非周活动礼包
	dbsd: [], // 夺宝商店礼包
	bjsr: [], // 补给商人礼包（和夺宝商店一样）
	htzh: [], // 黄天召唤-兑换商店兑换记录
	sglb: [],	// 时光礼包
	sglb1: [],	// 时光礼包
	sglb2: [],	// 元旦礼包
	hdlb: [],	// 囤货礼包（活动礼包）
	xljxlb: [],	// 修罗觉醒礼包（活动礼包）
	/**
	 * 周活动-特惠基金
	 * {
	 * 	isbuy: 1, // 是否购买了基金
	 *	num: 1, // 已经领取了前几天的基金奖励（未购买基金或从未领取时此值为0）
	 * }
	 */
	thjj: { type: Object },
	/**
	 * 周活动-特惠基金1
	 */
	thjj1: { type: Object },
	tjfx: { type: Number }, // 天降福星-已用的返利额度
	/**
	 * 时光占卜,例
	 * sgzb: {
	 *	free: 1,	// 已使用的免费次数,默认 0
	 *	pickgsid: 20461, // 选择的武将碎片gsid
	 *	time: 10,	// 已抽次数,默认 0
	 * }
	 */
	sgzb: { type: Schema.Types.Mixed },



	/*
		金牛献礼购买记录,例:
		jnxl: [
			0,	// 购买次数
			1,	// 购买次数
			2,	// 购买次数
		]
	 */
	jnxl: { type: Schema.Types.Mixed },

	/**
	 * 招财进宝
	 * {
	 * 		dayfree: 1,  					// 今日已使用的免费次数
	 * 		dayhit: 11, 					// 今日招财次数
	 * 		daycoin: 100000, 				// 今日通过招财获得的铜钱数量
	 * 		log: [							// 每日招财记录
	 * 			{
	 * 				time: 1614678067182,    // 招财时间
	 * 				count: 10,				// 招财次数
	 * 				cost: 10,				// 招财所消耗道具数量（元宝）
	 * 				get: 10000,				// 招财所获得道具数量（铜钱）
	 * 			}
	 * 		],
	 * 		box: [1,0,1,1]					// 宝箱奖励领取记录
	 * }
	 */
	zcjb: { type: Object },

	/**
	 * 许愿树
	 * {
	 * 	num: 29, // 浇水数量
	 * 	wishIndex: 0, // 所选愿望下标
	 *  wishDone: true, // 是否许愿完成
	 * }
	 */
	xysh: { type: Object },
	/**
	 * 鸿运当头
	 * [
	 * 	{
	 * 		id: "PALACE", // 红包出现位置ID,对应功能解锁表中的KEY
	 * 		end: 1611382877008, // 红包消失时间
	 * 		reward: [ { GSID: 38005, COUNT: 88 } ], // 已获得的奖励
	 *  }
	 * ]
	 */
	hydt: { type: Object },
	/**
	 * 欢聚一堂
	 * {
	 * 	spot: 42, // 总点数
	 * 	box: [1, 1, 1, 0, 1] // 进度宝箱领取记录
	 * }
	 */
	hjyt: { type: Object },
	/**
	 * ljdl: [
	 * 	100, // 初始化值为活动开始当天的累计登录天数，这个值在活动开始后第2天起，每登录一天会加1
	 *  1, // 以下为累计第几天的奖励领取标记，1为已领取
	 * 	1,
	 * 	1,
	 * 	1
	 * ]
	 */
	ljdl: [],// 累计登录奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	ljdl1: [],// 累计登录奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	/**
	 * dlhl: [
	 * 	100, // 初始化值为活动开始当天的登录豪礼天数，这个值在活动开始后第2天起，每登录一天会加1
	 *  1, // 以下为累计第几天的奖励领取标记，1为已领取
	 * 	1,
	 * 	1,
	 * 	1
	 * ]
	 */
	dlhl: [],// 登录豪礼奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	dlhl1: [],// 登录豪礼1奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	ljcz: [], // 累计充值
	ljcz1: [], // 累计充值1
	ljcz2: [], // 累计充值2
	ljcz3: [], // 累计充值3
	ljcz4: [], // 累计充值4
	overlord: [], // 霸王礼包(vip礼包)
	/**
	 * daypack: {
	 * 	daycost: 0|1, // 今天是否领取过一键购买的礼包
	 * 	ispay: 0|1, // 是否购买了一键购买的礼包，当day为0是回被充值为0
	 * 	day: 7, // 一键购买礼包后剩余的可领取天数
	 *  record: [1, 0, 1], // 每个礼包的领取（购买）记录,每天都清理
	 * }
	 */
	daypack: {}, // 每日礼包(周一到周天各不同)
	daycharge: { type: Array }, // 每日累冲奖励领取标记
	xflc: { stage: 0, money: 0, record: [] },//新服累充奖励
	mrsc: { type: Array }, //每日首充
	mrtj: {}, //每日特价
	shier: {}, //12元礼包
	zmfl: [], // 周末福利
	/**
	 *  新手周主题基金-高招
	 * zztjj_gz
	 * {
	 * ispay:0, // 是否购买,
	 * num:0, // 奖励领取次数
	 * }
	 *
	 */
	zztjj_gz: { ispay: 0, num: 0 }, // 新手周主题基金-高招
	zztjj_dj: { ispay: 0, num: 0 }, // 新手周主题基金-点将
	zztjj_gj: { ispay: 0, num: 0 }, // 新手周主题基金-挂机
	zztjj_gx: { ispay: 0, num: 0 }, // 新手周主题基金-观星
	/**
	 *  周主题基金-高招
	 * zztjj_gz
	 * {
	 * ispay:0, // 是否购买,
	 * num:0, // 奖励领取次数
	 * }
	 *
	 */
	zztjj1_gz: { ispay: 0, num: 0 }, // 周主题基金-高招
	zztjj1_dj: { ispay: 0, num: 0 }, // 周主题基金-点将
	zztjj1_gj: { ispay: 0, num: 0 }, // 周主题基金-挂机
	zztjj1_gx: { ispay: 0, num: 0 }, // 周主题基金-观星
	/*
	mjbg: {
		index: 0 // 当前楼层
		hased: ["0,1","1,2"] 已经获得过的终极宝物
		final: "0,1" // 选择的终极宝物,"层数下标,终极宝物下标"
		open: [0,0,0,...] // 前端宝箱领取标记 35 个
		openitem: [0,0,1,0,1...] // 后端宝箱领取标记，最后一个为终极宝箱标记
	}
	 */
	mjbg: {}, // 秘境宝阁
	/*
		招募许愿,内容结构如下
		zmqy: {
			gsidlist: [	// 武将信息表
				{
					gsid: 10201,				// 武将GSID
					got: 1581386086111, // 获得时间
				},
				{
					gsid: 13402,				// 武将GSID
				},
				...
			],
			val: 0,	// 祝福点数
		}
	*/
	zmqy: {},
	/**
	 * 圣诞笔记
	 * sdbj :{
	 * 	nowtotal:0, // 当前积分
	 * 	scorerewards:[] // 总积分对应的奖励是否领取了,按照下标记录领取 0未领取，1已达成，2已领取
	 * 	progress:[], //任务进度	0未达成,1已达成,2已领取
	 * }
	 */

	sdbj: {},
	/**
	 * 委托令(sjg 赏金阁委托令,maze 新远征委托令...),委托令集合到这里,

	 * key:value // 赏金阁:时间戳
	 * rewardcup :{sjg:'1234456',...}
	 */
	rewardcup: { type: Schema.Types.Mixed, default: {} },
	jgkl: { type: Schema.Types.Mixed, default: {} },// 机关傀儡 {gsid:xxxx};
	/**
	 * 许愿筑梦
	 * xyzm: {
	 * 	recruit: {	// 记录各种招募增加的许愿值
	 * 		friend: 1,
	 * 		normal: 4,
	 * 		premium: 10,
	 * 	}
	 * 	rolltimes: 0,// 已许愿次数
	 * 	record: [	// 抽奖获得记录
	 * 		{index: 2, time: 1634105256548},
	 * 		...
	 * 	]
	 * }
	 */
	xyzm: {},
	/**欢乐砸金蛋
	 * {
			progress: [0,0,0,0],//每日任务的四个任务标记 0 任务未完成 1 奖励可领取 2 奖励未领取
			jdList:{
				status:0,//0 未解锁 1 解锁没有砸金蛋 2 奖励没有领取 3 奖励已经领取
				awardItems:[]//用来存储金蛋奖励
			}
		}
	 */
	zjd: {},
	/**迎春筹办
	 * {
			pictures: [0,0,0,0...],//拼图Array
			limit:1//当前第几轮
			taskProcess:// 前四个对应行奖励  后四个对应列奖励 最后一列是终极奖励  状态 0:未达到领取条件 1 未领取 2 已领取
		}
	 */
	yccb: {},
	/**元宵灯会
	 *         //初始化5个灯谜 0//未点亮 1 已经点亮 每日刷新
	 */
	yxdh: [],
	/**招财聚宝
	 *
		{    multiples:[0,0,0,0],        //初始倍数  0 没有抽取 1 已经抽取 2 已经获得
			freeCount:1//免费次数
		}
	 */
	xczc: {},
	/**
	 * 活动福袋
	 * fudai: {
	 * 		yd_hyfd: { // 元旦好运福袋
	 * 			unlocktime: 0, // 解锁下一个福袋时间
	 * 			buycount: [1, null, 3], // 购买过的福袋次数记录
	 * 			rewardtime: [null, 1640105339000], // 领奖记录
	 * 		}
	 * }
	 */
	panda: { type: Object, default: {} },
	/**
	 * 熊猫新活动
	 * xyxc: {  限时观星-幸运星辰
	 * 		    season: 0, // 赛季
	 * 		}
	 * }
	 */
	fudai: { type: Object, default: {} },

	legion: { type: String, sparse: 1 }, // 军团ID
	legionName: { type: String }, // 军团名字
	// 加入军团时间
	legionjointime: { type: Number, default: 0 },
	lleft: { type: Number, default: 1 },
	lmission: {
		refresh: { type: Number, default: 1 },
		data: [],
	},
	lbossrecord: [], // 格式 [time, null ,time]； lbossrecord[bossIndex] = killTime; 已经击杀过了的 BOSS 再杀不会有奖励
	tech: { type: Schema.Types.Mixed, default: {} },

	update: { type: Number, default: Date.now },

	_icons: { type: String, default: '' },

	fboss: {
		num: { type: Number, default: 0 },
		last: { type: Number, default: Date.now },
	},

	teamid: { type: String },
	// 征战事件
	mapevent: {
		last: { type: Number }, // 上次刷新时间
		list: []  // 永久的事件id
	},

	// 上次王者演武目标刷新时间
	kprefresh: { type: Number },
	// 最高王者段位编号
	hstage: { type: Number },

	// 地牢最高关卡
	dgtop: {
		pass: { type: Number },
		chapter: { type: Number },
		node: { type: Number },
		update: { type: Number },
	},

	// 职业任务
	/**
	 * occtask {
	 * 		index:0,   //职业任务的步骤 0免费好礼,1...
	 * 		create:1234566,  // 创建时间
	 * 		giftpacks:{     // 职业礼包购买情况
				id:1001,	// 对应配置表礼包id 唯一
				time:1234567 // 购买时间
			},
			occtype:1,  // 职业类型 1 战士,2...
			cachegiftid: 0 //  刷新礼包获得的id
			refreshcount:0 // 默认0
	 * }
	 */
	occtask: { type: Schema.Types.Mixed, default: {} },
	// 职业活动结束时间
	occtaskend: { type: Number, default: 0 },
	// 职业塔
	/**
	 * occtower{
	 * "refresh":0, // 每日刷新扫荡令上限
	 * "floor":[2] // 层数对应赠送的扫荡令
	 * }
	 */
	occtower: { type: Schema.Types.Mixed, default: {} },
	// 赏金阁下次重置时间(30天)
	bountyend: { type: Number, default: 0 },
	// 新远征(迷宫)下次标记重置时间(30天)
	mazeend: { type: Number, default: 0 },
	// 阵营积分
	campscore: {
		wei: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
		shu: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
		wu: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
		qun: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
		shen: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
		mo: {
			num: 0,
			update: { type: Number, default: Date.now },
		},
	},
	// vip战斗因子(暂时影响征战与远征),在征战的时候挑战完这一个大关(比如当前虎牢关,打过虎牢关)才会重新计算
	vipbattlefactor: { type: Number, default: 0 },
	// 实名认证奖励发放标记， 1为已通过邮件发送奖励，0为为发放或未实名
	vreward: { type: Number, default: 0 },
	/*
	 定制礼包数据结构如下:
	 dzlb: {
		  // 礼包id
		1001: {
			// 已购买次数
			buytime: 1,
		}
	 }
	 */

	/**
	 * 记忆比拼
	 */
	jybp: {},
	/*
	 RMB定制礼包数据结构如下:
	 dzlbrmb: {
		  // 礼包id
		1001: {
			// 已购买次数
			buytime: 1,
		}
	 }
	 */
	dzlbrmb: {},
	dzlbrmb2: {},
	dzlb: {},
	/*
		武将封赏系统
	 */
	general_official: {
		official: Object, // 官职 ,格式 { 1: guid, 2:guid, 3:null} // 官职下标 ： 武将guid,未分配为null,未解锁，就不会有对应的官职下标key
		retinue: Object,  // 随从 , 格式 {1: guid, 2: guid,3:null,4: 1523001249423} // 同上，多一个 时间戳，是被冻结的随从位，时间为冻结失效的时间

	},
	// 所以活动的记录字段, {lhlj:{}}// key对应活动类型
	act: {
		type: Object,
		default: {}
	},
	set: { // role 的配置
		vipHide: { // 是否隐藏 vip的展示
			type: Boolean,
			default: false
		}
	},
	// 角色创建时间
	create: { type: Number, default: Date.now },
	/**
	 * 七日目标
	 * {
	 *     gift: [0,1,2,0,1], // 充值礼包购买记录
	 *     wel: [0, 1, 2, 0, 1] // 福利礼包购买记录
	 * }
	 */
	weektarget: { type: Object, default: {} },
	twoweektarget: { type: Object, default: {} },
	sevenlogin: [], // 七日登录礼包购买记录
	fourteenlogin: [], // 14日签到礼包购买记录
	jthl: [], // 常驻活动积天豪礼的领取标记
	/**
	 * 任务武将升至20级记录升级的武将id,结构如下
	 * generallv20re: {
	 * 	'612d92fa37f2712e5aa4a299',
	 * 	'612c495e18de527a1a73b56a',
	 * 	...
	 * }
	 */
	generallv20re: { type: Object },
	/**
	 * 珍宝普通免费抽奖使用时间
	 * 冷却完成
	 * Date.now() > (zhenbao_free + zhenbao_roll_others.FREE_CD_HOUR)
	 */
	zhenbao_free: Number,
	/**
	 * 珍宝基金开始时间
	 * 时间戳
	 */
	zhenbao_fund_start: Number,
	zhenbao_fund_start1: Number,
	/**
	 * 珍宝基金购买时间,终极大奖领取后随lazyref刷新
	 */
	zhenbao_fund_buytime: Number,
	/**
	 * 珍宝基金购买时间,终极大奖领取后随lazyref刷新
	 */
	zhenbao_fund_buytime1: Number,
	/**
	 * 珍宝抽奖保底计数
	 */
	zhenbao_roll_counter4sure_normal: Number,
	zhenbao_roll_counter4sure_premium: Number,

	/**
	 * 印记抽奖保底计数
	 */
	signet_roll_red: Number,

	last_step: { type: Number }, // 新手引导最后一步id

	// 神将特惠
	sjth: { type: Object, default: {} },

	daygift: [],//每日礼包 策划说新做
	xsqg: [],//限时抢购
	chapterAnim: {}, //漫画章节奖励
	// 称号
	_titles: { type: Schema.Types.Mixed, default: {} },
	// 正在使用的称号id
	titleid: { type: Number, default: 0 },

	//客户端需要临时缓存，凌晨清空
	tempClient: {
		generalUpPower: { type: Number, default: 1 },
		generalUpLeg: { type: Number, default: 1 },
		clear: { type: Number, default: 0 },
	},

	//群雄逐鹿队伍id
	qxzlteamid: { type: String },
	//群雄逐鹿隐藏队伍id
	hideteamid: { type: String },
	//群雄逐鹿战绩id
	qxzlrecord: { type: Object, default: {} },
	mrthyj: { type: Array },//每日特惠一键礼包15
	/**
	 * 天命
	   val: {type: Number, default: 0},
	   general: {type: Array, default: []},
	   temprefersh:{type: Object, default:{}},
	   refersh:{type:Array, default:[3,3,3]},
	 */
	destiny: { type: Object, require: true },


	//摸金校尉层数
	mjxw: { type: Number, default: 1 },
	//连续充值
	lxljcz: {
		task: { type: Array, default: [] },
		all: {
			got: {
				type: Number, default: 0
			}
		}
	},
	lxljcz1: {
		task: { type: Array, default: [] },
		all: {
			got: {
				type: Number, default: 0
			}
		}
	},
	lxljcz2: {
		task: { type: Array, default: [] },
		all: {
			got: {
				type: Number, default: 0
			}
		}
	},
	lxljcz3: {
		task: { type: Array, default: [] },
		all: {
			got: {
				type: Number, default: 0
			}
		}
	},
	seat: { type: Object, default: {} },
	// 邀请码功能
	inviter: { type: Number, default: 0 },  // 邀请人rno
	mjxxl: { type: Object },//消消乐,
	cjzm: { type: Object },//超级招募
	cjzmsyh: { type: Object },//超级招募商业化
	ftmphb: {},//飞天猫排行榜
	//vip折扣商店
	vipzksd1: {
		time: { type: Number, default: 0 },
		record: { type: Array, default: [] }
	},
	vipzksd2: {
		time: { type: Number, default: 0 },
		record: { type: Array, default: [] }
	},
	vipzksd3: {
		time: { type: Number, default: 0 },
		record: { type: Array, default: [] }
	},
	vipzksd4: {
		time: { type: Number, default: 0 },
		record: { type: Array, default: [] }
	},
	// 返利礼包
	fllb1: { type: Object, default: {} },
	fllb2: { type: Object, default: {} },
	fllb3: { type: Object, default: {} },
	fllb4: { type: Object, default: {} },
	// 惠顾礼包
	hglb1: { type: Array, default: [] },
	hglb2: { type: Array, default: [] },
	hglb3: { type: Array, default: [] },
	hglb4: { type: Array, default: [] },
	// 神魔招募限时
	smzmxs1: {
		freetime: { type: Number, default: 0 },
		smflrecord: { type: Array, default: [] },
		smlbrecord: { type: Array, default: [] },
		xlbjrecord: { type: Array, default: [] },
		val: { type: Number, default: 0 },
	},
	bless: {
		legion: { type: Number, default: 0 },
		manor: { type: Number, default: 0 },
		speed: { type: Number, default: 0 },
		help: { type: Array, default: [] },
	},
	dltp: {
		map: { type: Array, default: [1001, 2001, 3001, 4001, 5001] },
		shop: { type: Object, default: {} },
		mopup: { type: Array, default: [2, 2, 2, 2, 2] }
	}
}
