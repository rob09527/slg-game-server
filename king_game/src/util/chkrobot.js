
'use strict'

module.exports = exports = async (ret) =>{
	// chk robot
	let config = global.gameconfig.robotpvp;
	let count = await global.dao.robot.find().count();
	if (count == 0) {
		let p = [];
		for (let {ID} of config){
			p.push(global.dao.robot.create({robot: ID}))
		}
		await Promise.all(p);
		console.log('INSERT ROBOT DONE');
	}else if (count > 0 && count < config.length) {
		throw new Error('robot num error');
	}
}