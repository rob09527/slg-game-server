
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: true, unique:1 },
	uid: {type: String, require: true},

	// 角色创建时使用的渠道
	channel: {type: String},
	// 包名
	bundle: {type: String, default: 'default'},
	// 角色创建时登陆的平台
	platform: {type: String},
	// 是否模拟器(仅在安卓平台时出现)
	simulator: {type: Boolean},
	// 设备类型
	phonetype: {type: String},
	// 设备ID
	deviceid: {type: String},

	servid: {type: Number, require: true, index: 1},
	rno: {type: Number, require: true},

	rname: {type: String, sparse: true, minlength: 1},	//todo: 长度限制?特殊字符验证?
	mood: {type: String, sparse: true, maxlength: 64}, // 用户签名(心情语)
	sex: {type: Number, min: 0, max: 1, default: 0},
	autodecomp: Number, // 是否开启自动遣散武将,默认 false

	iconid: {type: Number, default: 10261}, // 即将作废
	// 装饰系统-头像列表
	_heads:{type: Schema.Types.Mixed, default: {50009:-1}},
	// 正在使用的头像
	headid:{type: Number},
	// 形象列表
	_images:{type: Schema.Types.Mixed, default: {52029:-1}},
	// 正在使用的形象id
	imageid: {type: Number},
	// 头像框
	_frames:{type: Schema.Types.Mixed, default: {51001:-1}},
	// 皮肤列表
	_skins:{type:Schema.Types.Mixed,default:{}},
	// 正在使用的头像框id
	frameid: {type: Number, default: 51001},

	tutor: {type: Number, default: 2},	// 导师 1战士 2刺客 3法师 4射手

	// 征战地图下标
	_maxmapid: {type: Number, default: 0},
	chaperupdate: {type: Number, default: Date.now},
	lastreap: {type: Number, default: Date.now},
	lastgain: {type: Number, default: Date.now},
	hide: {type: Schema.Types.Mixed, default: {}},
	props: {type: Schema.Types.Mixed, default: {}},
	others: {type: Schema.Types.Mixed, default: {}},
	zbpiece: {type: Schema.Types.Mixed, default: {}},

	cdkeys: {type: Schema.Types.Mixed, default: {}},

	battlearr: {type: Schema.Types.Mixed, default: {}},
	mythical: {type: Schema.Types.Mixed, default: {}},

	tower: {type: Number, default: 0},
	_towertoken: {
		last: {type: Number, default: Date.now},
		num: {type: Number, default: 10},
	},

	_power: {type: Number, default: 0},
	_powerbattleset: {type: Schema.Types.Mixed, default: {}},

	pvpscore: {type: Number},
	pvpupdate: {type: Number, default: Date.now},
	pvpwinchain: {type: Number},	// 连胜次数

	recruitfree: {
		normal: {type: Number, default: 1111111111111},
		premium: {type: Number, default: 1111111111111},
	},

	gnum: {type: Number, default: 0},

	special: {
		type: Object,
		default: {}
	},

	friends: [],

	gain_cache: [],

	online: {type: Number},

	// 首充的时间点
	firstcharge: {type: Number},

	ssppack: {level: [], gstar: []},
	pflb:[], // 皮肤礼包
	czlb: [],
	cplb: [],//寻宝礼包
	xsdh: [],
	jrlb1: [],
	jrlb2: [],
	gxlb: [],
	szhc: [],
	gjlb: [],
	smbx:[],// 周活动-神秘宝箱
	cjxg1:[],// 春节vip限购1
	cjxg2:[],// 春节限购2
	cjxg3:[],// 弹窗礼包3
	gjdl:[],// 挂机掉落
	hqsd:[],// 欢庆商店
	gzlb:[],// 高招周礼包
	sbjl:[],// 神兵降临
	wjzh:[],// 武将组合
	wjcs:[],// 武将重生
	thlb:[],// 特惠礼包
	dwlb:[],// 端午礼包
	jhlb:[],// 钜惠礼包
	jhlb1:[],// 钜惠礼包
	swlb:[],// 神威礼包
	swlb1:[],// 神威礼包
	wzqd:[],// 万众期待-宝箱进度领取标记
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
	thjj: { type: Object },
	/**
	 * 周活动-特惠基金1
	 */
	thjj1: { type: Object },
	tjfx: { type: Number }, // 天降福星-已用的返利额度
	sgzb: {type: Schema.Types.Mixed},
	jnxl: {type: Schema.Types.Mixed},
	zcjb: { type: Object },
	xysh: { type: Object },
	hydt: { type: Object },
	hjyt: { type: Object },
	ljdl:[],// 累计登录奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	ljdl1:[],// 累计登录奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	dlhl:[],// 登录豪礼奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	dlhl1:[],// 登录豪礼1奖励领取标记,数组第一个元素为每日首次登录标记值（90215），这个值在活动期间每天更新一次，其余为元素为累计奖励领取标记
	ljcz:[], // 累计充值
	ljcz1:[], // 累计充值1
	ljcz2:[], // 累计充值2
	ljcz3:[], // 累计充值3
	ljcz4:[], // 累计充值4	
	overlord:[], // 霸王礼包(vip礼包)
	daypack:{}, // 每日礼包(周一到周天各不同)
	daycharge: { type: Array }, // 每日累冲奖励领取标记
	xflc: {stage:0, money:0,record:[]},//新服累充奖励
	mrsc: {type: Array}, //每日首充
	mrtj: {}, //每日特价
	shier: {}, //12元礼包
	zmfl: [], // 周末福利
	zztjj_gz:{ispay:0,num:0}, // 新手周主题基金-高招
	zztjj_dj:{ispay:0,num:0}, // 新手周主题基金-点将
	zztjj_gj:{ispay:0,num:0}, // 新手周主题基金-挂机
	zztjj_gx:{ispay:0,num:0}, // 新手周主题基金-观星

	zztjj1_gz:{ispay:0,num:0}, // 周主题基金-高招
	zztjj1_dj:{ispay:0,num:0}, // 周主题基金-点将
	zztjj1_gj:{ispay:0,num:0}, // 周主题基金-挂机
	zztjj1_gx:{ispay:0,num:0}, // 周主题基金-观星
	mjbg: {}, // 秘境宝阁
	zmqy: {},
	sdbj:{},
	rewardcup:{type:Schema.Types.Mixed,default:{}},
	jgkl:{type:Schema.Types.Mixed,default:{}},// 机关傀儡 {gsid:xxxx};
	xyzm: {},
	zjd:{},
	yccb:{},
	yxdh:[],
	xczc:{},
	fudai: { type: Object, default: {} },
	
	legion: {type: String, sparse: 1}, // 军团ID
	// 加入军团时间
	legionjointime:{type: Number, default: 0},
	lleft: {type: Number, default: 1},
	lmission: {
		refresh: {type: Number, default: 1},
		data: [],
	},
	lbossrecord: [], // 格式 [time, null ,time]； lbossrecord[bossIndex] = killTime; 已经击杀过了的 BOSS 再杀不会有奖励
	tech: {type: Schema.Types.Mixed, default: {}},

	update: {type: Number, default: Date.now},

	_icons: {type: String, default: ''},

	fboss: {
		num: {type: Number, default: 0},
		last: {type: Number, default: Date.now},
	},

	teamid: {type: String},
	// 征战事件
	mapevent: {
		last: {type: Number}, // 上次刷新时间
		list:[]  // 永久的事件id
	},

	// 上次王者演武目标刷新时间
	kprefresh: {type: Number},
	// 最高王者段位编号
	hstage: {type: Number},

	// 地牢最高关卡
	dgtop: {
		pass: {type: Number},
		chapter: {type: Number},
		node: {type: Number},
		update: {type: Number},
	},

	// 职业任务
	occtask:{type: Schema.Types.Mixed,default:{}},
	// 职业活动结束时间
	occtaskend:{type: Number, default:0 },
	// 职业塔
	occtower:{type:Schema.Types.Mixed,default:{}},
	// 赏金阁下次重置时间(30天)
	bountyend:{type:Number,default:0},
	// 新远征(迷宫)下次标记重置时间(30天)
	mazeend:{type:Number,default:0},
	// 阵营积分
	campscore: {
		wei: {
			num: 0,
			update: {type: Number, default: Date.now},
		},
		shu: {
			num: 0,
			update: {type: Number, default: Date.now},
		},
		wu: {
			num: 0,
			update: {type: Number, default: Date.now},
		},
		qun: {
			num: 0,
			update: {type: Number, default: Date.now},
		},
	},
	// vip战斗因子(暂时影响征战与远征),在征战的时候挑战完这一个大关(比如当前虎牢关,打过虎牢关)才会重新计算
	vipbattlefactor:{type:Number,default:0},
	// 实名认证奖励发放标记， 1为已通过邮件发送奖励，0为为发放或未实名
	vreward: { type: Number, default: 0},
	jybp:{},
	dzlbrmb: {},
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
	create: {type: Number, default: Date.now},
	weektarget: { type: Object, default: {} },
	sevenlogin: [], // 七日登录礼包购买记录
	fourteenlogin: [], // 14日签到礼包购买记录
	jthl: [], // 常驻活动积天豪礼的领取标记
	generallv20re: {type: Object},
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

	// 武将列表
	_generals:{type: Schema.Types.Mixed, default: []},
	last_step: {type: Number}, // 新手引导最后一步id

	// 神将特惠
	sjth:{ type: Object, default: {} },

	daygift:[],//每日礼包
	xsqg:[],//限时抢购
	// 称号
	_titles:{type:Schema.Types.Mixed,default:{}},
	titleid:{type: Number, default: 0},

	//客户端需要临时缓存，凌晨清空
	tempClient:{
		generalUpPower: {type: Number, default: 1},
		generalUpLeg: {type: Number, default: 1},
		clear:{type: Number, default: 0},
	 }
}
