
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {LEGION: {FACTORY_LVLIMIT: limit}} = global.gameconfig.others;
	ctx.assert(ctx.legion.level >= limit, 'legion lvlimit');
	ctx.getNewMission = function () {
		const config = global.gameconfig.legionflevel[ctx.legion.flevel - 1];
		ctx.assert(config, 'invalid flevel');
		const {MNUM, RADD} = config;
		let remain = ctx.role.lmission.data.filter(function (m) {
			return m.stime;
		})
		const m_config = global.gameconfig.legionmission;
		const rate = m_config.deepMap('W');
		let key = Date.now();
		let new_missions = [];
		while(new_missions.length < MNUM) {
			const index = ctx.random.inweight(rate);
			const m = m_config[index];
			if (!m) continue;
			key++;
			new_missions.push({
				key: key.toString(),
				id: m.ID,
			})
		}
		remain = remain.append(new_missions);
		return remain;
	}
	await next();
}