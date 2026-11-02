const battle_control = require('./battle_control');
const bConfig = require("./battle_config")
const legionBossSeason = {
	1: { pmrdc: 500 },
	2: { pdex: 350 },
	3: { pprdc: 500 },
	4: { pmdex: 350 }
}

class DoBattleClass {
	doUpdate() {
		if (this.isOver) {
			return
		}
		if (this.battle.updateOneStep()) {
			this.isOver = true
			return true
		}
		this.round += 1
		return false
	}
	IsBattleOver() {
		return this.isOver
	}
	doBattle(battleseed, player, enemy, nRound, season, lcards, rcards, btype) {
		this.battleseed = battleseed,
			this.player = player,
			this.enemy = enemy
		this.nRound = nRound
		this.season = season
		this.lcards = lcards
		this.rcards = rcards
		this.btype = btype
		this.isOver = false
		this.round = 0;
		this.m_overdata = null

		if (bConfig.IsShowDebug()) {
			bConfig.ClearRecordLog()
		}
		let battle = new battle_control();
		battle.GetBTools().setSeed(battleseed)

		battle.SetIsDoUIThings(false);

		nRound = nRound || 3600
		battle.setBattleTime(nRound);
		if (btype === "pvpequal") {
			season.left = 1;
			season.right = 1;
			lcards = [{ id: 2171 }];
			rcards = [{ id: 2171 }];
			if (player.mythic) {
				player.mythic.level = 120;
				player.mythic.onlyeff = 1;
			}
			if (enemy.mythic) {
				enemy.mythic.level = 120;
				enemy.mythic.onlyeff = 1;
			}
		}
		battle.setSeasonInfo(season);
		battle.setCardInfo("right", rcards);
		battle.setCardInfo("left", lcards);

		if (btype == "legionwarmobboss" && enemy.team) {
			for (let k in enemy.team) {
				let info = legionBossSeason[season.season];
				for (let m in info) {
					enemy.team[k].property[m] += info[m];
				}
			}
		}
		//角色 神兵 阵法 陷阱 战车
		battle.setPlayerInfo(player.team, "left");
		battle.setThicInfo(player.mythic, "left");
		battle.setZhenfa(player.zhenfa, "left");
		battle.setTrapInfo(player.trap, "left");
		battle.setChariotInfo(player.chariot, "left");

		battle.setPlayerInfo(enemy.team, "right");
		battle.setThicInfo(enemy.mythic, "right");
		battle.setZhenfa(enemy.zhenfa, "right");
		battle.setTrapInfo(enemy.trap, "right");
		battle.setChariotInfo(enemy.chariot, "right");

		battle.initLeftUnitData();
		battle.initRightUnitData();
		battle.initUnitBaseData();

		this.battle = battle
	}

	CollectBattleResult() {
		console.log(this.battle._result)
		if (!this.m_overdata) {
			let left = {};
			let lpercent = {};
			let lmp = {};
			let leftnow = 0;
			let leftmax = 0;
			this.battle.leftUnitArr.forEach(ele => {
				if (isNaN(ele.born)) return;
				// todo delete 留血 
				// ele.battleInfo.hp = 0.1 * ele.initInfo.hp;

				left[ele.born] = Math.ceil(ele.battleInfo.hp);
				lpercent[ele.born] = Math.ceil(ele.battleInfo.hp * 10000 / ele.initInfo.hp);
				lmp[ele.born] = Math.floor(ele.nowmagic);
				leftnow += ele.battleInfo.hp;
				leftmax += ele.initInfo.hp;
			})
			let right = {};
			let rpercent = {};
			let rmp = {};
			for (let k in this.enemy.team) {
				right[k] = this.enemy.team[k].nowhp || 0;
				rpercent[k] = this.enemy.team[k].hppercent || 0;
			}
			let rlosthp = 0;     // 对右边造成的总伤害 
			let rightnow = 0;
			let rightmax = 0;
			this.battle.rightUnitArr.forEach(ele => {
				if (isNaN(ele.born)) return;
				// todo delete test
				// ele.battleInfo.hp = 0;

				right[ele.born] = Math.ceil(ele.battleInfo.hp);
				rpercent[ele.born] = Math.ceil(ele.battleInfo.hp * 10000 / ele.initInfo.hp);
				rmp[ele.born] = Math.floor(ele.nowmagic);
				rlosthp += Math.floor(ele.initInfo.hp) - Math.ceil(ele.battleInfo.hp);
				rightnow += ele.battleInfo.hp;
				rightmax += ele.initInfo.hp;
			})

			if (this.btype == "pvpking") {
				this.battle._result = Math.ceil(leftnow * 10000 / leftmax) >= Math.ceil(rightnow * 10000 / rightmax) ? "win" : "lose";
			}
			if (bConfig.IsShowDebug()) {
				bConfig.AddRecordLog("steps:" + (this.round + 1))
				bConfig.ShowRecordLog()
			}

			this.m_overdata = {
				ret: this.battle._result,
				round: this.round,
				lhp: left, rhp: right,
				lper: lpercent, rper: rpercent, 			// 左右当前血量万分比
				lmp: lmp, rmp: rmp,
				ltper: Math.ceil(leftnow * 10000 / leftmax),
				rtper: Math.ceil(rightnow * 10000 / rightmax),
				rlosthp: rlosthp,
				report: this.battle.getBattleData(),
				version: 202304201430
			};
		}
		return this.m_overdata
	}
}
module.exports = DoBattleClass