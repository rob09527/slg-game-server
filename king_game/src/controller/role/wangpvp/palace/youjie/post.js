
'use strict'

const {
	SHAME_ACTION_REWARD,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	let {
		_id,
		type,
	} = ctx.request.body;
	type = Number.parseInt(type);
	ctx.assert(ctx.role.getProp(90525) < 3, 'no more');
	let shameRole = ctx.kingdom.shames.filter(function ({_id: obj_id}) {
		return obj_id.toString() === _id
	});
	shameRole = shameRole[0];
	ctx.assert(shameRole, 'invalid rid');
	ctx.assert(shameRole.rid !== ctx.role.i(), 'cant doit');
	let cond = {
		_id: ctx.kingdom._id,
		'shames._id': _id,
	}
	let $inc = {
		[`shames.$.actions.${type}`]: 1,
	}
	await ctx.dao.c_kingdom.updateOne(cond, {$inc});
	//TODO 更新缓存
	shameRole.actions[type]++;
	ctx.role.addItemsNoSave(90525);
	let rewards = SHAME_ACTION_REWARD[type];
	rewards = rewards.map(({GSID, MINCOUNT, MAXCOUNT, LVR = 0}) =>{
		let COUNT = Math.floor(ctx.random.between(MINCOUNT, MAXCOUNT) + ctx.role.level * LVR);
		return {
			GSID,
			COUNT,
		}
	})
	ctx.role.addItemsNoSave(rewards);
	ctx.role.missionInvoke('WANG_SHAME');
	await ctx.role.save();
	ctx.body = {
		rewards,
		youjie: {
			actions: shameRole.actions,
		}
	}
}