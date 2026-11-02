// 征战功能测试
module.exports = async (exec, role, util) => {
	let rankService = new global.services.RankService('manor', 1);
	const r = await rankService.set({
		id: '60f7e1bc5862ad715a26bbb2',
		score: 2
	});
	console.log(r);
}
