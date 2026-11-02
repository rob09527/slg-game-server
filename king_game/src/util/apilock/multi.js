
'use strict'

const {msgcenter} = global;

module.exports = exports = {
	chkAndLock: async ({serv, uid, path}) =>{
		let data = {
			type: 'lock',
			rid: serv+'|'+uid,
			path,
		}
		let {ret} = await msgcenter.send({type: 'worker.apilock', data});
		return !ret;
	},
	unLock: async ({serv, uid, path}) =>{
		let data = {
			type: 'unlock',
			rid: serv+'|'+uid,
			path,
		}
		await msgcenter.send({type: 'worker.apilock', data});
	}
}