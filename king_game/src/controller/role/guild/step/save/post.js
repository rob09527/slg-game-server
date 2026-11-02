
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {steps = []} = ctx.request.body;
	if (!Array.isArray(steps)) steps = [steps];
	let lastStep = 0;
	for (let info of steps) {
		if (typeof info !== 'object') continue;
		let {step, time = Date.now(), mark} = info;
		if (!step) continue;
		try{
			await ctx.dao.guildstep.create({rid: ctx.role._id, step, mark, create: time});
			ctx.role.notifyGuildStep(step, mark);
			lastStep = mark.taskid;
		}catch(e){
		}
	}
	if(+lastStep) { // 保存最后一步进入角色表，方便统计
		await ctx.role.updateOne({$set: {
				last_step: +lastStep
        }})
	}
	ctx.body = {};
}
