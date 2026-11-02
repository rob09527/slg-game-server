
'use strict'
const _ = require('lodash');
const moment = require('moment');
const ms = require('ms');
const { ATTCK_CITY: attack_city = 0 } = global.gameconfig.nationwar.SCORE
let lock = 0;

exports.name = "国战-定时战斗逻辑";
// 定时器语句
exports.cron = '*/10 * 20,21 * * 6,1,3,4'; //正式配置


let lastFlushTime = 0;
/**
 * @return {Promise<void>}
 */
exports.main = async function () {

	let startTime = Date.now();
	let time830 = moment().startOf('days').valueOf() + ms('21h')
	// 根据round获取下一轮开战时间
	const getRoundTime = function (roundNum) {
		// 根据下一轮的round获取下次开战时间。
		let _num = roundNum; // 服务器数量
		let time;
		if (_num == 2 || _num == 3) {
			// _num == 2周六晚上打完，设置周一晚上8点
			// 当天周六
			// _num == 3周一晚上8点,设置周三打
			// 当天周一
			let date = moment().startOf('days').add(2, 'days').valueOf();
			time = date + ms('20h') + ms('30m');
			//  time = Date.now() + ms('5m');
		} else if (_num == 4) {
			// 周三晚上8点,设置周四打
			// 当天周三
			let date = moment().startOf('days').add(1, 'days').valueOf();
			time = date + ms('20h') + ms('30m');
			//   time = Date.now() + ms('5m');

		} else if (_num == 5) {
			// 5的话说明是最后一轮了。时间设置为周四9点结束。
			let date = moment().startOf('days').valueOf();
			time = date + ms('21h') + ms('5m');
			//  time = Date.now() + ms('5m');
		}
		return time;
	}
	// 获取nexttime时间
	const getTime10s = function (startTime, round, time830) {
		// 判断是否已经开战了。开战则设置下一个10s行动回合。
		// 判断是否已经到8点30分了。是的话则不进行逻辑操作。
		let _round = round;
		let time;
		if (startTime >= time830) {
			time = getRoundTime(_round);
		} else {
			// 每次加10s。
			time = startTime + ms('10s');
		}
		return time;
	}
	// 单独抽离战斗逻辑
	const fight_loop = async function (ctx, groupmarkinfo, startTime, round, time830) {
		const g_mark = groupmarkinfo;
		// 查所有未淘汰的服务器
		let nation_Servers = await ctx.dao.nationwar_serverinfo.find(
			{ finish: { $exists: 0 }, groupmark: g_mark },
			{
				areamark: 1,
				nowhp: 1,
				front: 1,
				back: 1,
				pre: 1,
				infield: 1,
				wincount: 1,
				groupid: 1
			}).sort({ position: 1 });
		// 整个组别战斗结束标记。
		let groupbattleisend = false;

		// 查单个服务器信息
		for (let s = 0; s < nation_Servers.length; s++) {
			// 第一个服务器的前军对第二个服务器的后军。以此类推
			// 最后一个服务器的前军对第一个服务器的前军。
			let frontServerInfo = nation_Servers[s];
			frontServerInfo = await ctx.dao.nationwar_serverinfo.findOne({ _id: frontServerInfo._id }, {
				areamark: 1,
				nowhp: 1,
				front: 1,
				back: 1,
				pre: 1,
				infield: 1,
				wincount: 1
			})

			let backServerInfo;
			if (s == nation_Servers.length - 1) {
				// 最后一个了。则取第一个
				backServerInfo = nation_Servers[0];
			} else {
				backServerInfo = nation_Servers[s + 1];
			}
			backServerInfo = await ctx.dao.nationwar_serverinfo.findOne({ _id: backServerInfo._id }, {
				areamark: 1,
				nowhp: 1,
				front: 1,
				back: 1,
				pre: 1,
				infield: 1,
				wincount: 1
			})
			// 起变量名
			let attackway = ["left", "right"];
			// 记录双方初始血量
			let frontserverhp = frontServerInfo.nowhp;
			let backserverhp = backServerInfo.nowhp;
			// areamark
			let front_areamark = frontServerInfo.areamark;
			let back_areamark = backServerInfo.areamark;
			// 定义需要使用的变量
			let video, ret, version, hpper, role_military_level, target_military_level, gcache, live_general_count, role_general_star, target_general_star, l_role, t_role
			let losescore = 0;
			let winscore = 0;
			// 查询是否有创建战报记录
			let reportInfo = await ctx.dao.nationwar_record.findOne({ groupmark: g_mark, areastand: `${frontServerInfo.areamark}_${backServerInfo.areamark}` }, { report: 1 });
			if (!reportInfo) {
				reportInfo = await ctx.dao.nationwar_record.create({
					groupmark: g_mark, areastand: `${frontServerInfo.areamark}_${backServerInfo.areamark}`
				})
			}

			for (let way of attackway) {
				// 分为左翼和右翼。
				let frontTeam = frontServerInfo.infield.front[`${way}`].length > 0 ? frontServerInfo.infield.front[`${way}`] : [{ pos: 0 }];
				let backTeam = backServerInfo.infield.back[`${way}`].length > 0 ? backServerInfo.infield.back[`${way}`] : [{ pos: 0 }];
				// 左边攻城行为
				frontServerInfo.infield.front[`${way}attackcity`] = 0;
				let front_Attack_city = frontServerInfo.infield.front[`${way}attackcity`];
				// 右边攻城行为
				backServerInfo.infield.back[`${way}attackcity`] = 0;
				let back_Attack_city = backServerInfo.infield.back[`${way}attackcity`];
				let frontServerTeam = frontServerInfo.front[`${way}`];
				let backServetTeam = backServerInfo.back[`${way}`];
				// 前军下标
				let frontserver_index = frontServerInfo.front[`${way}index`] || 0;
				// 前军信息
				let frontserver_front = frontServerTeam[frontserver_index];
				// 后军下标
				let backserver_index = backServerInfo.back[`${way}index`] || 0;
				// 后军信息
				let backserver_back = backServetTeam[backserver_index];
				// 战报信息
				let report = reportInfo.report[`${way}`];
				// console.log('way', way)
				// console.log('frontTeam', frontTeam);
				// console.log('backTeam', backTeam);
				// console.log('frontServerTeam', frontServerTeam);
				// console.log('backServetTeam', backServetTeam);
				// console.log('frontserver_index', frontserver_index);
				// console.log('frontserver_front', frontserver_front);
				// console.log('backserver_index', backserver_index);
				// console.log('backserver_back', backserver_back);
				// 判断是否可以战斗
				if (frontTeam.length > 0 && backTeam.length > 0 && frontTeam[0].pos + backTeam[0].pos == 6) {
					console.log('两数相加等于6')
					// 判断是否单边攻城
					if (frontTeam[0].pos == 6) {
						console.log('左边攻城')

						// 攻城玩家也算击杀次数
						let role = await ctx.dao.nationwar_battleinfo.findOne({ servid: frontTeam[0].servid, uid: frontTeam[0].uid, areamark: front_areamark },
							{ wincount: 1, c_battleset: 1, g_cache: 1, servid: 1, uid: 1, score: 1, rname: 1 })

						if (!frontTeam[0].live_general_count || !frontTeam[0].general_star) {
							// 没有战斗过，没有这些数据。需要获取
							let bset = role.c_battleset[frontTeam[0].teamid] || { team: {} };
							// 我方武将星级
							frontTeam[0].general_star = 0;
							frontTeam[0].live_general_count = 0;
							for (const pos in bset.team) {
								const general = bset.team[pos];
								if (!general) continue;
								frontTeam[0].general_star += general.star;
								// 存活的武将
								frontTeam[0].live_general_count++
							}
						}

						// 左边攻城
						// 右边玩家的服务器扣分
						// 计算攻城得分

						let f_general_star = frontTeam[0].general_star - 35 < 0 ? 0 : frontTeam[0].general_star;
						let attack_score = Math.floor(attack_city * (frontTeam[0].live_general_count / 7 * 0.45 + f_general_star / 56 * 0.55))
						attack_score = attack_score > 0 ? attack_score : attack_city;
						console.log(`${role.servid}_${role.uid}_攻城得分`, attack_score);

						// 记录左边攻城得分
						front_Attack_city = attack_score;
						backserverhp -= attack_score;
						// 分数累加
						attack_score += role.score || 0;
						console.log('加完攻城得分后的分数', attack_score);
						// 加入战报
						// if (front_Attack_city > 0) {
						// 	let obj = {
						// 		btime: startTime,
						// 		attack_role: { rname: role.rname, servid: role.servid, uid: role.uid },
						// 		attack_value: front_Attack_city,
						// 		'direction': way
						// 	};
						// 	report.push(obj);
						// 	reportInfo.report[`${way}`] = report;
						// 	console.log('NATIONWAR_ATTACK_CITY', role.servid, role.uid, front_Attack_city, way, frontTeam[0].teamid, new Date().toLocaleString())
						// }
						// 更新玩家胜利分数
						await ctx.dao.nationwar_battleinfo.updateOne({ servid: frontTeam[0].servid, uid: frontTeam[0].uid, areamark: front_areamark }, { $set: { wincount: role.wincount + 1, score: attack_score } })

						// 改变攻城玩家的状态
						let frontindex = frontServerTeam.findIndex((info) => info.uid == frontTeam[0].uid && info.teamid == frontTeam[0].teamid);
						if (frontindex !== -1) frontServerTeam[frontindex].state = 3;

						// 左边的玩家离开战场
						frontTeam = _.drop(frontTeam);
						// 重新赋值
						frontServerInfo.front[`${way}`] = frontServerTeam;
						frontServerInfo.infield.front[`${way}`] = frontTeam;
						frontServerInfo.infield.front[`${way}attackcity`] = front_Attack_city;

						// 如果右边有人。则添加到战场
						if (backserver_back) {
							// 右边新上场玩家的状态信息更新
							backServetTeam[backserver_index].state = 1;
							// 右边玩家添加一个人在战场
							backServerInfo.infield.back[`${way}`].push({
								servid: backServetTeam[backserver_index].servid,
								uid: backServetTeam[backserver_index].uid,
								pos: 1,
								teamid: backServetTeam[backserver_index].teamid,
							})
							// 右边新上场玩家的下标更新
							backserver_index += 1;
							backServerInfo.back[`${way}index`] = backserver_index;
							// 右边重新赋值保存
							backServerInfo.back[`${way}`] = backServetTeam;
						}
						// 右边服务器胜利次数
						frontServerInfo.wincount += 1;

					} else if (backTeam[0].pos == 6) {
						console.log('右边攻城')
						// 攻城玩家也算击杀次数
						let role = await ctx.dao.nationwar_battleinfo.findOne({ servid: backTeam[0].servid, uid: backTeam[0].uid, areamark: back_areamark },
							{ wincount: 1, c_battleset: 1, g_cache: 1, servid: 1, uid: 1, score: 1, rname: 1 })

						if (!backTeam[0].live_general_count || !backTeam[0].general_star) {
							// 没有战斗过，没有这些数据。需要获取
							let bset = role.c_battleset[backTeam[0].teamid] || { team: {} };
							// 我方武将星级
							backTeam[0].general_star = 0;
							backTeam[0].live_general_count = 0;
							for (const pos in bset.team) {
								const general = bset.team[pos];
								if (!general) continue;
								backTeam[0].general_star += general.star;
								// 存活的武将
								backTeam[0].live_general_count++
							}
						}
						// 右边攻城
						// 左边玩家的服务器扣血
						// 计算攻城得分
						let b_general_star = backTeam[0].general_star - 35 < 0 ? 0 : backTeam[0].general_star - 50;
						let attack_score = Math.floor(attack_city * (backTeam[0].live_general_count / 7 * 0.45 + b_general_star / 56 * 0.55));
						attack_score = attack_score > 0 ? attack_score : attack_city;
						console.log(`${role.servid}_${role.uid}_攻城得分`, attack_score);

						// 右边攻城得分
						back_Attack_city = attack_score;
						frontserverhp -= attack_score;
						// 分数累加
						attack_score += role.score || 0;
						console.log('加完攻城得分后的分数', attack_score);
						// 加入战报
						// if (back_Attack_city > 0) {
						// 	let obj = {
						// 		btime: startTime,
						// 		attack_role: { rname: role.rname, servid: role.servid, uid: role.uid },
						// 		attack_value: back_Attack_city,
						// 		'direction': way
						// 	};
						// 	report.push(obj);
						// 	reportInfo.report[`${way}`] = report;
						// 	console.log('NATIONWAR_ATTACK_CITY', role.servid, role.uid, back_Attack_city, way, backTeam[0].teamid, new Date().toLocaleString())

						// }
						// 更新玩家攻城得分
						await ctx.dao.nationwar_battleinfo.updateOne({ servid: backTeam[0].servid, uid: backTeam[0].uid, areamark: back_areamark }, { $set: { wincount: role.wincount + 1, score: attack_score } })

						// 改变攻城玩家的状态
						let backindex = backServetTeam.findIndex((info) => info.uid == backTeam[0].uid && info.teamid == backTeam[0].teamid);
						if (backindex !== -1) backServetTeam[backindex].state = 3;
						// 右边的玩家离开战场
						backTeam = _.drop(backTeam);

						// 重新赋值
						backServerInfo.back[`${way}`] = backServetTeam;
						backServerInfo.infield.back[`${way}`] = backTeam;
						backServerInfo.infield.back[`${way}attackcity`] = back_Attack_city;
						// 如果左边有人。则添加到战场
						if (frontserver_front) {
							// 左边新上场玩家的状态信息更新
							frontServerTeam[frontserver_index].state = 1;
							// 左边玩家添加一个人在战场
							frontServerInfo.infield.front[`${way}`].push({
								servid: frontServerTeam[frontserver_index].servid,
								uid: frontServerTeam[frontserver_index].uid,
								pos: 1,
								teamid: frontServerTeam[frontserver_index].teamid
							})
							// 左边边新上场玩家的下标更新
							frontserver_index += 1;
							frontServerInfo.front[`${way}index`] = frontserver_index;
							// 左边重新赋值保存
							frontServerInfo.front[`${way}`] = frontServerTeam;
						}
						// 右边服务器胜利次数
						backServerInfo.wincount += 1;
					} else {
						// 双方战斗
						// 战斗
						// 取信息玩家信息
						let leftrole = frontTeam[0];
						let right_target = backTeam[0];
						let r_score = 0;
						let t_score = 0;
						console.log('双方开始打架');

						// 取玩家的队伍阵容信息
						let role = await ctx.dao.nationwar_battleinfo.findOne({ servid: leftrole.servid, uid: leftrole.uid, areamark: front_areamark },
							{ wincount: 1, c_battlesetpower: 1, servid: 1, c_battleset: 1, uid: 1, killcount: 1, c_apply: 1, g_cache: 1, score: 1 })
						let target = await ctx.dao.nationwar_battleinfo.findOne({ servid: right_target.servid, uid: right_target.uid, areamark: back_areamark },
							{ wincount: 1, c_battlesetpower: 1, servid: 1, c_battleset: 1, uid: 1, killcount: 1, c_apply: 1, g_cache: 1, score: 1 })
						if (!role || !target) {
							// 如果有玩家不存在则跳过
							console.log(`国战-用户信息不存在-role:${role},target:${target}`);
							continue;
						}
						role = role.toObject();
						target = target.toObject();
						role.c_battleset = role.c_battleset || {};
						target.c_battleset = target.c_battleset || {};
						// 整理阵容数据
						role.c_battleset = role.c_battleset[leftrole.teamid] || { team: {} };
						target.c_battleset = target.c_battleset[right_target.teamid] || { team: {} };
						let r_gcache = role.g_cache || {};
						let t_gache = target.g_cache || {};
						// 缓存的阵容数据
						role.g_cache = r_gcache && !r_gcache[leftrole.teamid] ? {} : r_gcache[leftrole.teamid];
						target.g_cache = t_gache && !t_gache[right_target.teamid] ? {} : t_gache[right_target.teamid];
						// 记录该轮次挑战标记
						role.c_apply = role.c_apply || {};
						target.c_apply = target.c_apply || {};
						let role_apply = role.c_apply[`${round}`] || 1;
						role.c_apply[`${round}`] = role_apply;
						let target_apply = target.c_apply[`${round}`] || 1;
						target.c_apply[`${round}`] = target_apply;
						console.log('req_role', role);
						console.log('req_target', target);
						// 发起战斗请求
						let requestData = await ctx.dao.nationwar_battleinfo.challengeUser({ role, target, sid: role.servid });
						if (requestData.error) {
							// 报错
							console.log('requestData', requestData.error)
							// 按照战力大小,阵容战斗力高的获胜
							if (role.c_battleset[leftrole.teamid] > target.c_battleset[target.teamid]) {
								ret = 'win';
							} else {
								ret = 'lose';
							}
							// 录像id调为异常。
							video = 'fade';
							version = 0;
						} else {
							// 没有报错
							({
								video, ret, version, hpper, role_military_level, target_military_level,
								winscore,
								losescore, gcache,
								live_general_count,
								role_general_star,
								target_general_star,
								l_role,
								t_role
							} = requestData);
						}
						// 其中一方淘汰。
						if (ret == 'lose') {
							console.log('打输了')
							// 左边的玩家出战状态更新 左边被淘汰
							let frontindex = frontServerTeam.findIndex((info) => info.uid == frontTeam[0].uid && info.teamid == frontTeam[0].teamid);
							frontServerTeam[frontindex].state = 2;
							// 左边淘汰
							frontTeam = _.drop(frontTeam);
							// 右边服务器胜利次数
							backServerInfo.wincount += 1;
							// 胜利玩家保存血量百分比
							backTeam[0].hpper = hpper;
							// 胜利方存活武将
							backTeam[0].live_general = live_general_count;
							// 胜利方全武将星级
							backTeam[0].general_star = target_general_star;
							// 保存武将血量
							r_gcache[leftrole.teamid] = gcache;
							// 右边加人
							// 右边已经在场上的人位置+1
							if (backTeam.length > 0 && backTeam[0].pos != 0) {
								backTeam = backTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}
							if (backserver_back) {
								// 右边新上场玩家的状态信息更新
								backServetTeam[backserver_index].state = 1;
								// 右边玩家添加一个人在战场
								backTeam.push({
									servid: backServetTeam[backserver_index].servid,
									uid: backServetTeam[backserver_index].uid,
									pos: 1,
									teamid: backServetTeam[backserver_index].teamid
								});
								// 右边新上场玩家的下标更新
								backserver_index += 1;
								backServerInfo.back[`${way}index`] = backserver_index;
							}
							r_score = role.score || 0;
							t_score = target.score || 0;
							console.log(`${leftrole.uid}_${leftrole.servid}_失败得分`, losescore)
							console.log(`${target.uid}_${target.servid}_胜利得分`, winscore)

							// 更新左边玩家的胜利次数
							await ctx.dao.nationwar_battleinfo.updateOne({ servid: leftrole.servid, uid: leftrole.uid, areamark: front_areamark }, { $set: { killcount: 0, c_apply: role.c_apply, score: r_score + losescore } })

							// 更新右边玩家的单次胜利次数
							await ctx.dao.nationwar_battleinfo.updateOne({ servid: target.servid, uid: target.uid, areamark: back_areamark }, { $set: { wincount: target.wincount + 1, killcount: target.killcount + 1, c_apply: target.c_apply, g_cache: r_gcache, score: t_score + winscore } })


						} else {
							console.log('打赢了')
							// 右边的玩家出战状态更新 右边被淘汰
							let backindex = backServetTeam.findIndex((info) => info.uid == backTeam[0].uid && info.teamid == backTeam[0].teamid);
							backServetTeam[backindex].state = 2;
							// 右边淘汰
							backTeam = _.drop(backTeam);
							// 胜利玩家保存血量百分比
							frontTeam[0].hpper = hpper;
							// 胜利玩家玩家军衔
							frontTeam[0].military_level = role_military_level;
							// 胜利方存活武将
							frontTeam[0].live_general = live_general_count;
							// 胜利方武将星级
							frontTeam[0].general_star = role_general_star;
							// 左边服务器胜利次数
							frontServerInfo.wincount += 1;
							// 胜利玩家保存血量百分比
							frontTeam[0].hpper = hpper;
							// 保存武将血量
							t_gache[right_target.teamid] = gcache;
							// 左边已经在场上的人位置+1
							if (frontTeam.length > 0 && frontTeam[0].pos != 0) {
								frontTeam = frontTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}

							// 左边加人
							if (frontserver_front) {
								// 左边新上场玩家的状态信息更新
								frontServerTeam[frontserver_index].state = 1;
								// 左边玩家添加一个人在战场
								frontTeam.push({
									servid: frontServerTeam[frontserver_index].servid,
									uid: frontServerTeam[frontserver_index].uid,
									pos: 1,
									teamid: frontServerTeam[frontserver_index].teamid
								})
								// 左边边新上场玩家的下标更新
								frontserver_index += 1;
								frontServerInfo.front[`${way}index`] = frontserver_index;
							}
							console.log(`${leftrole.servid}_${leftrole.uid}_胜利得分`, winscore)
							console.log(`${target.servid}_${target.uid}_失败得分`, losescore)

							r_score = role.score || 0;
							t_score = target.score || 0;
							// 更新左边玩家的单次胜利次数
							await ctx.dao.nationwar_battleinfo.updateOne({ servid: leftrole.servid, uid: leftrole.uid, areamark: front_areamark }, { $set: { wincount: role.wincount + 1, killcount: role.killcount + 1, c_apply: role.c_apply, score: r_score + winscore } })
							// 更新右边玩家的总胜利次数
							await ctx.dao.nationwar_battleinfo.updateOne({ servid: target.servid, uid: target.uid, areamark: back_areamark }, { $set: { killcount: 0, c_apply: target.c_apply, score: t_score + losescore } })

						}
						// 判断是否是初始值
						if (frontTeam.length == 1 && frontTeam[0].pos == 0) {
							frontTeam = [];
						}
						if (backTeam.length == 1 && backTeam[0].pos == 0) {
							backTeam = [];
						}
						// 重新赋值保存
						frontServerInfo.infield.front[`${way}`] = frontTeam;
						frontServerInfo.front[`${way}`] = frontServerTeam;
						frontServerInfo.infield.front[`${way}attackcity`] = front_Attack_city;
						backServerInfo.infield.back[`${way}`] = backTeam;
						backServerInfo.back[`${way}`] = backServetTeam;
						backServerInfo.infield.back[`${way}attackcity`] = back_Attack_city;
						// 保存战报
						if (video != 'fade') {
							// 保存录像格式
							let myVideo = await global.dao.video.create({
								type: 'nationwar',
								video,
								version
							})
							let vid = myVideo._id.toString();
							let obj = {
								btime: startTime,
								videoid: vid,
								result: ret,
								hpper,
								l_role: {
									rname: l_role.rname, servid: leftrole.servid, uid: leftrole.uid, 'teamid': leftrole.teamid,
									'way': 'front', 'direction': way, imageid: l_role.imageid, headid: l_role.headid, frameid: l_role.frameid, level: l_role.level, bset: l_role.battleset ? l_role.battleset[leftrole.teamid] : {}
								},
								r_role: {
									rname: t_role.rname, servid: right_target.servid, uid: right_target.uid, 'teamid': right_target.teamid,
									'way': 'back', 'direction': way, imageid: t_role.imageid, headid: t_role.headid, frameid: t_role.frameid, level: t_role.level, bset: t_role.battleset ? t_role.battleset[right_target.teamid] : {}
								},
								l_role_honor_value: winscore,
								r_role_honor_value: losescore
							};
							report.push(obj);
							reportInfo.report[`${way}`] = report;
							console.log('NATIONWAR_ATTACK', leftrole.servid, leftrole.uid, winscore, way, leftrole.teamid, new Date().toLocaleString())
							console.log('NATIONWAR_ATTACK', right_target.servid, right_target.uid, losescore, way, right_target.teamid, new Date().toLocaleString())
						}
					}

				} else if (frontTeam.length >= 0 && backTeam.length >= 0 && frontTeam[0].pos + backTeam[0].pos < 6) {
					// 往前走
					// 判断是否有人
					// 左边没人
					console.log('不够人数开打,继续加人')
					//  额外去判断谁应该加人。
					if (frontTeam[0].pos >= 0 && backTeam[0].pos >= 0 && (frontTeam[0].pos + 1) + (backTeam[0].pos + 1) > 6) {
						console.log('双方下一站位人数相加大于6')
						// 场上人数少的位置向前
						if ((frontTeam.length > backTeam.length && (backTeam.length >= 1 && backTeam[0].pos != 0) || (backTeam.length == 1 && backTeam[0].pos == 0 && backserver_back)) ||
							(frontTeam.length == 1 && !frontserver_front && frontTeam[0].pos == 0)) {
							// 左边人数多,右边加
							console.log('左边人数多,右边加')
							// 已经在场上的人位置+1
							if (backTeam.length > 0 && backTeam[0].pos != 0) {
								backTeam = backTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}
							// 每次pos=0为空的时候,backTeam赋值为空。
							if (backTeam.length == 1 && backTeam[0].pos == 0) {
								backTeam = [];
							}

							if (backserver_back) {
								console.log('右边加人')
								// 右边新上场玩家的状态信息更新
								backServetTeam[backserver_index].state = 1;
								// 右边玩家添加一个人在战场
								backTeam.push({
									servid: backServetTeam[backserver_index].servid,
									uid: backServetTeam[backserver_index].uid,
									pos: 1,
									teamid: backServetTeam[backserver_index].teamid
								})
								// 右边新上场玩家的下标更新
								backserver_index += 1;
								backServerInfo.back[`${way}index`] = backserver_index;

							}
							// 右边重新赋值保存
							backServerInfo.infield.back[`${way}`] = backTeam;
							backServerInfo.infield.back[`${way}attackcity`] = back_Attack_city;
							backServerInfo.back[`${way}`] = backServetTeam;

						} else {
							// 右边人数多,左边加
							console.log('右边人数多,左边加')
							// 已经在场上的人位置+1
							if (frontTeam.length > 0 && frontTeam[0].pos != 0) {
								frontTeam = frontTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}
							// 每次pos=0为空的时候,frontTeam赋值为空。
							if (frontTeam.length == 1 && frontTeam[0].pos == 0) {
								frontTeam = [];
							}
							// 双方往前走一步。
							if (frontserver_front) {
								console.log('左边加人')
								// 左边新上场玩家的状态信息更新
								frontServerTeam[frontserver_index].state = 1;
								// 左边玩家添加一个人在战场
								frontTeam.push({
									servid: frontServerTeam[frontserver_index].servid,
									uid: frontServerTeam[frontserver_index].uid,
									pos: 1,
									teamid: frontServerTeam[frontserver_index].teamid
								})
								// 左边边新上场玩家的下标更新
								frontserver_index += 1;
								frontServerInfo.front[`${way}index`] = frontserver_index;
							}
							// 左边重新赋值保存
							frontServerInfo.infield.front[`${way}`] = frontTeam;
							frontServerInfo.infield.front[`${way}attackcity`] = front_Attack_city;
							frontServerInfo.front[`${way}`] = frontServerTeam;
						}

					} else {
						console.log('下一场双方相加小于6')
						// 下一场双方相加小于6
						if (frontTeam[0] && frontTeam[0].pos > 0) {
							console.log('左边加人准备')
							// 已经在场上的人位置+1
							if (frontTeam.length > 0 && frontTeam[0].pos != 0) {
								frontTeam = frontTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}
						}
						// 每次pos=0为空的时候,frontTeam赋值为空。
						if (frontTeam.length == 1 && frontTeam[0].pos == 0) {
							frontTeam = [];
						}
						// 双方往前走一步。
						if (frontserver_front) {
							console.log('左边加人')
							// 左边新上场玩家的状态信息更新
							frontServerTeam[frontserver_index].state = 1;

							// 左边玩家添加一个人在战场
							frontTeam.push({
								servid: frontServerTeam[frontserver_index].servid,
								uid: frontServerTeam[frontserver_index].uid,
								pos: 1,
								teamid: frontServerTeam[frontserver_index].teamid
							})
							// 左边边新上场玩家的下标更新
							frontserver_index += 1;
							frontServerInfo.front[`${way}index`] = frontserver_index;

						}

						// 左边重新赋值保存
						frontServerInfo.infield.front[`${way}`] = frontTeam;
						frontServerInfo.infield.front[`${way}attackcity`] = front_Attack_city;
						frontServerInfo.front[`${way}`] = frontServerTeam;

						if (backTeam[0] && backTeam[0].pos > 0) {
							console.log('右边加人准备')
							// 已经在场上的人位置+1
							if (backTeam.length > 0 && backTeam[0].pos != 0) {
								backTeam = backTeam.map((data) => {
									data.pos += 1
									return { ...data }
								})
							}

						}
						// 每次pos=0为空的时候,backTeam赋值为空。
						if (backTeam.length == 1 && backTeam[0].pos == 0) {
							backTeam = [];
						}
						if (backserver_back) {
							console.log('右边加人')
							// 右边新上场玩家的状态信息更新
							backServetTeam[backserver_index].state = 1;
							// 右边玩家添加一个人在战场
							backTeam.push({
								servid: backServetTeam[backserver_index].servid,
								uid: backServetTeam[backserver_index].uid,
								pos: 1,
								teamid: backServetTeam[backserver_index].teamid
							})
							// 右边新上场玩家的下标更新
							backserver_index += 1;
							backServerInfo.back[`${way}index`] = backserver_index;
						}

						// 右边重新赋值保存
						backServerInfo.infield.back[`${way}`] = backTeam;
						backServerInfo.infield.back[`${way}attackcity`] = back_Attack_city;
						backServerInfo.back[`${way}`] = backServetTeam;
					}
				}
				//   console.log('frontServerInfo.front', frontServerInfo.front);
				//  console.log('backServerInfo.back', backServerInfo.back);
			}
			//  保存信息
			// 保存服务器血量、站位、是否淘汰
			let frontupd = {
				$set: {
					nowhp: frontserverhp < 0 ? 0 : frontserverhp,
					infield: frontServerInfo.infield,
					front: frontServerInfo.front,
					wincount: frontServerInfo.wincount
				}
			};
			let backupd = {
				$set: {
					nowhp: backserverhp < 0 ? 0 : backserverhp,
					infield: backServerInfo.infield,
					back: backServerInfo.back,
					wincount: backServerInfo.wincount,
				}
			}

			// 更新
			await ctx.dao.nationwar_serverinfo.updateOne({ _id: frontServerInfo._id }, frontupd);
			await ctx.dao.nationwar_serverinfo.updateOne({ _id: backServerInfo._id }, backupd);
			// 更新战报
			await ctx.dao.nationwar_record.updateOne({ _id: reportInfo._id }, { $set: { report: reportInfo.report } });
			// 血量为0,则整个循环终止。已经打完
			// 判断服务器血量
			if (frontserverhp <= 0) {
				let time = getRoundTime(round + 1);
				// 淘汰
				await ctx.dao.nationwar_serverinfo.updateOne({ _id: frontServerInfo._id }, { $set: { isout: round, finish: Date.now() } });
				await global.dao.nationwar_match.updateMany({ groupmark: g_mark, }, { $set: { state: 3, nexttime: time, nextroundtime: time + ms('3m') } });
				groupbattleisend = true;
				break;
			}
			if (backserverhp <= 0) {
				let time = getRoundTime(round + 1);
				await ctx.dao.nationwar_serverinfo.updateOne({ _id: backServerInfo._id }, { $set: { isout: round, finish: Date.now() } });
				await global.dao.nationwar_match.updateMany({ groupmark: g_mark }, { $set: { state: 3, nexttime: time, nextroundtime: time + ms('3m') } });
				groupbattleisend = true;
				break;
			}
			//如果已经9点,但是还没有人淘汰。则血量最少的人淘汰
			if (startTime >= time830) {
				// 如果已经9点了,则设置下一轮
				// 血量最少的淘汰
				let time = getRoundTime(round + 1);
				let has_isOut_server = await ctx.dao.nationwar_serverinfo.findOne({ isout: round, groupmark: g_mark }, { areamark: 1, servid: 1 });
				if (!has_isOut_server) {
					let serverInfos = await ctx.dao.nationwar_serverinfo.find({ finish: { $exists: 0 }, groupmark: g_mark }, { nowhp: 1, areamark: 1 }).sort({ nowhp: 1 }).limit(1);
					if (serverInfos.length > 0) {
						console.log('已经9点了,血量最少的服务器淘汰:', serverInfos[0].areamark);
						await ctx.dao.nationwar_serverinfo.updateOne({ areamark: serverInfos[0].areamark }, { $set: { isout: round, finish: Date.now() } });
					}
					await global.dao.nationwar_match.updateMany({ groupmark: g_mark }, { $set: { state: 3, nexttime: time, nextroundtime: time + ms('3m') } });
					// 跳出标记
					groupbattleisend = true;
					break;
				}
			}
		}
		// 
		nation_Servers.forEach(s => {
			// 告诉客户端刷新页面
			global.remote.pushClientAll(s.groupid, {
				type: 'nationwar', // 国战战报
				content: { 'refresh_report': 1 }
			});
		})


		if (groupbattleisend) {
			console.error('NATIONWAR 小组已经有服务器胜出:组别为', g_mark, new Date().toLocaleString())
		}

		if (startTime < time830) {
			// 更新下一次整个组的行动时间
			await global.dao.nationwar_match.updateOne({ round, groupmark: g_mark }, { $set: { nexttime: getTime10s(startTime, round, time830) } });
		}
		return `${g_mark} ${new Date().toLocaleString()}`
	}

	// 查是否有开战 ------前期查询
	let round, nexttime
	let stateInfo = await global.dao.nationwar_match.find({ state: 2 }, { state: 1, round: 1, nexttime: 1, nextroundtime: 1 }).sort({ round: 1, nexttime: -1 }).limit(1);
	if (stateInfo.length > 0) {
		console.error('NATIONWAR 已开战', new Date().toLocaleString());
		round = stateInfo[0].round;
		nexttime = stateInfo[0].nexttime;
		time830 = stateInfo[0].nextroundtime;
	} else {
		console.error('NATIONWAR 获取当前最新场次', new Date().toLocaleString());
		// 获取当前战斗最新的轮次。
		let roundInfo = await global.dao.nationwar_match.find({ state: 1 }, { round: 1, nexttime: 1, nextroundtime: 1 }).sort({ round: 1, nexttime: -1 }).limit(1);
		if (roundInfo && roundInfo.length == 1) {
			round = roundInfo[0].round;
			nexttime = roundInfo[0].nexttime;
			if (startTime > nexttime) {
				console.error('NATIONWAR 设置为开战中', new Date().toLocaleString());
				if (nexttime + ms('30m') < Date.now()) {
					nexttime = Date.now();
				}
				// 更新当前战斗状态为开战中
				await global.dao.nationwar_match.updateMany({ round }, { $set: { state: 2, nextroundtime: nexttime + ms('30m') } });
				time830 = nexttime + ms('30m');
				// await global.dao.nationwar_match.updateMany({ round }, { $set: { state: 2, nextroundtime: nexttime + ms('5m') } });
				// time830 = nexttime + ms('5m');
			}
		} else {
			//等待重置数据
			console.error('NATIONWAR WAITING RESET', new Date().toLocaleString())
			return
		}
	}

	if (!round || round == 5) {
		// 没有数据,未开始
		console.error('NATIONWAR CHALLENGE NO DATA', new Date().toLocaleString());
		return;
	} else {
		// round 有。判断当前时间是否可以开战
		if (startTime < nexttime) {
			console.error('NATIONWAR HAS END ', new Date().toLocaleString());
			return;
		}
	}
	// 加入锁
	if (lock > Date.now()) {
		console.error('NATIONWAR 单次10s未执行完毕', new Date().toLocaleString());
		return;
	}
	lock = Date.now() + ms('3m');

	//  正文开始 -----------------
	// 取参赛的大组
	let nationwarInfos = await global.dao.nationwar_match.distinct('groupmark', { state: 2 });
	// 根据大组mark。取出数据
	const loop = []
	for (let nationwar of nationwarInfos) {
		let g_mark = nationwar;
		// 并发执行
		loop.push(fight_loop(global, g_mark, startTime, round, time830));
	}

	await Promise.all(loop).then((result) => {
		console.log(result)
	}).catch((error) => {
		console.log(error)      // 失败了，打出 '失败'
	})

	console.error('NATIONWAR CHALLENGE DOING', new Date().toLocaleString());
	// 释放锁
	lock = 0;
	lastFlushTime = Date.now();
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
	return true;
}