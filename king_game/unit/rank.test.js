// 征战功能测试
module.exports = async (exec, role, util) => {
	let r;
	let isok;

	util.timer();   // 时间开始
	{
		r = await exec('role/rank/get', {rank: 'pvp'});
		util.assert(Array.isArray(r.list), '列表', util.timer());
		util.assert(Array.isArray(r.selfrank), '玩家排行', util.timer());
	}
}
