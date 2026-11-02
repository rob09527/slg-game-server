
'use strict'


const getpvpinfo = require("../../../../../model/c_pvp_three/instance/getpvpinfo");
const matchscore = require("../../../../../model/c_pvp_three/instance/matchscore");
//测试一下真人对打录像的情况
module.exports = exports = async (ctx) => {
	try {
		let { battleid } = ctx.request.body;
		// 查找目标 
		console.log('finish 0', battleid)
		let battles = await ctx.dao.c_battle.find({ label: battleid });
		console.log(ctx.role.getItems(99518).count)
		console.log('finish 1')
		if (ctx.role.getItems(99518).count < 3) {
			let freeitem = { gsid: 99518, count: global.gameconfig.pvpmultiplayer[2][0]['NUM'] }
			ctx.role.addItemsNoSave(freeitem);
		} else {
			let item = { gsid: global.gameconfig.pvpmultiplayer[2][0]['ID'], count: global.gameconfig.pvpmultiplayer[2][0]['NUM'] }
			ctx.role.castItemsNoSave(item);
		}
		await ctx.role.save()
		console.log('finish 2')
		ctx.body = []
		let wincount = 0
		let targetrid = ''
		var target
		let list = []
		let role3v3 = await global.dao.c_pvp_three.findOne({ rid: ctx.role.rid });
		for (let x = 0; x < battles.length; x++) {
			let body = {}
			let battle = battles[x]
			// target = battle.mark;
			targetrid = battle.mark
			if (targetrid.startsWith('robot')) {
				// 机器人默认1000
				target = {
					score: 1000,
				}
			} else {
				target = await global.dao.c_pvp_three.findOne({ rid: targetrid });
			}
			ctx.assert(target, 'invalid target');
			// 战斗计算
			ctx.assert(battle, 'invalid battleid');
			await battle.cal();
			list.push(battle)
			let { result: ret } = battle;
			if (ret.ret == 'win') {
				wincount += 1
			}
		}
		let ridlist = [ctx.role.rid, targetrid]
		let settlementresult = await settlement(ridlist, wincount > 1 ? 0 : 1, ctx)
		//当前用户
		var base_self = settlementresult.list[settlementresult['isuserwin'] ? 0 : 1]
		var base_tar = settlementresult.list[settlementresult['isuserwin'] ? 1 : 0]


		for (let x = 0; x < list.length; x++) {
			let body = {}
			let battle = list[x]

			let { result: ret } = battle;
			if (ret.ret == 'win') {
				wincount += 1
			}
			body = { result: ret };
			body.reward = [];
			// 录像保存
			let {
				seed,
				season,
				rcards,
				lcards,
				result: {
					version,
					ret: result,
					lper, rper,
					ltper, rtper,
					report,
				}
			} = battle;
			let video = {
				seed,
				result,
				season,
				lper, rper,
				ltper, rtper,
				report,
				left: {
					info: {
						rname: ctx.role.name,
						level: ctx.role.level,
						iconid: ctx.role.iconid,
						headid: ctx.role.headid,
						frameid: ctx.role.frameid
					},
					'set': battle.player,
				},
				right: {
					info: {
						rname: target.name,
						level: target.level,
						iconid: target.iconid,
						headid: target.headid,
						frameid: target.frameid
					},
					'set': battle.enemy,
				},
				lcards,
				rcards
			}
			let videostr = JSON.stringify(video);

			let myVideo = new ctx.dao.video({
				type: 'pvp3vs3',
				rid: ctx.role.rid,
				video: videostr,
				mark: [video.result, role3v3.score, base_self].join('.'),
				version,
			});
			// 异步保存
			myVideo.save().catch(console.error);
			body.videoid = myVideo.i();
			body.gameresult = settlementresult
			ctx.body.push(body)
			if (!target.rid) continue;
			console.log('finish 3')
			ctx.dao.video.create({
				type: 'pvp3vs3',
				rid: target.rid,
				video: videostr,
				mark: [video.result === 'win' ? 'lose' : 'win', target.score, base_tar].join('.'),
				version,
			}).catch(console.error);
			console.log('finish 4')
		}
		console.log('结束')
	} catch (error) {
		console.error('finish error', error)
		ctx.assert(false, JSON.stringify(error));
		ctx.assert(true, JSON.stringify(error));
	}

}



async function settlement(ridlist, win_index, ctx) {
	let winer
	let failer
	let isuserwin = false
	await Promise.all(ridlist.map(async (e, index) => {
		let result
		if (e.startsWith('robot')) {
			let [
				_,
				robotid,
			] = e.split('_');
			const config = global.gameconfig.pvpmultiplayer.robot[robotid][0];
			result = {
				score: config.L0,
				rid: e,
			}

		} else {
			result = await global.dao.c_pvp_three.findOne({ rid: e })
		}
		if (index == 0 && index == win_index) {
			isuserwin = true
		}

		if (index == win_index) {
			winer = result
		} else {
			failer = result
		}
	}))

	if (!winer || !failer) {
		console.error(winer, failer, ridlist)
		throw ('error settlement')
	}
	//win基础分
	let jcfwiner = 20
	//fail基础分
	let jcffail = 20
	if (winer.score - failer.score >= 50) {
		jcfwiner += Math.floor((winer.score - failer.score) / 50) * 2
	}

	if (failer.score - winer.score >= 50) {
		jcffail += Math.floor((failer.score - winer.score) / 50) * 2
	}

	//win
	//胜利方差值
	const czscorewin = 20
	let winerscore = Math.floor((jcfwiner + (failer.score - winer.score) / czscorewin))
	console.log('成功者', winer.rid, '添加分数', winerscore, "组成成分", jcfwiner, failer.score, winer.score)

	//fail 
	//失败方差值
	let failecz = failer.score - winer.score
	const czscorefail = 20
	if (failecz >= czscorefail) {
		//基础分减少1积分
		jcffail -= Math.floor(failecz / czscorefail)
	}

	let failescore = Math.floor((jcffail + (failer.score - winer.score) / czscorefail))
	console.log('失败者', failer.rid, '扣除分数', failescore, "组成成分", jcffail, failer.score, winer.score)

	//放这里一起处理阵容
	let theChallenged
	if (isuserwin) {
		theChallenged = await matchscore(winer.score, ctx)
	} else {
		theChallenged = await matchscore(failer.score, ctx)
	}

	let insert = {
	}
	insert['theChallenged'] = theChallenged


	winer.score = Math.floor(winer.score + winerscore)
	failer.score = Math.floor(failer.score - failescore)
	if (failer.score < 0) {
		failer.score = 0
	}
	//防止算法错误
	if (winer.score < 0) {
		winer.score = 0
	}
	let rankService = new global.services.RankService('pvp3vs3')
	let list = []
	if (winer.rid.startsWith('robot')) {
		list = [
			global.dao.c_pvp_three.updateOne({ rid: failer.rid }, { score: failer.score }),
			global.dao.c_pvp_three.updateOne({ rid: ctx.role.rid }, { $set: insert }),
			rankService.set({
				id: failer.rid,
				score: failer.score
			})]
	} else if (failer.rid.startsWith('robot')) {
		list = [global.dao.c_pvp_three.updateOne({ rid: winer.rid }, { score: winer.score }),
		global.dao.c_pvp_three.updateOne({ rid: ctx.role.rid }, { $set: insert }),
		rankService.set({
			id: winer.rid,
			score: winer.score
		})]
	} else {
		list = [global.dao.c_pvp_three.updateOne({ rid: winer.rid }, { score: winer.score }),
		global.dao.c_pvp_three.updateOne({ rid: failer.rid }, { score: failer.score }),
		global.dao.c_pvp_three.updateOne({ rid: ctx.role.rid }, { $set: insert }),
		rankService.set({
			id: winer.rid,
			score: winer.score
		}), rankService.set({
			id: failer.rid,
			score: failer.score
		})]
	}
	await Promise.all(list)
	let data = {
		list: [winerscore, -failescore],
		winer: {
			score: winer.score,
			updateScore: winerscore,
		},
		failer: {
			score: failer.score,
			updateScore: -failescore,
		},
		isuserwin: isuserwin
	}
	return data
}
