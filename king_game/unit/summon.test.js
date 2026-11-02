// 酒馆功能测试
module.exports = async (exec, role, util) => {
    let r;
    let isok;

    util.timer();
    const types = {
        '魏': 1,
        '蜀': 2,
        '吴': 3,
        '群': 4,
        '帝魔': 5,
    }

    for (const t in types) {
        console.log('【点将' + t + '单抽】', '开始...');
        r = await exec('role/summon', {times: 1, type: types[t]}).catch(e => e);
        isok = !!r.length;
        util.assert(isok, '点将' + t + '单抽', r, util.timer());

        console.log('【点将' + t + '十连】', '开始...');
        r = await exec('role/summon', {times: 10, type: types[t]}).catch(e => e);
        isok = !!r.length;
        util.assert(isok, '点将' + t + '十连', r, util.timer());
    }

}
