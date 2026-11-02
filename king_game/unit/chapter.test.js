// 征战功能测试
module.exports = async (exec, role, util) => {
    let r;
    let isok;

    util.timer();
    console.log('【阵容获取】', '开始...');
    r = await exec('role/chapter/challenge/data', {}).catch(e => e);
    isok = !!r.chapter;
    util.assert(isok, '阵容获取', r, util.timer());

    console.log('【对阵开始】', '开始...');
    r = await exec('role/chapter/challenge/start', {}).catch(e => e);
    isok = !!r.battleid;
    util.assert(isok, '对阵开始', r, util.timer());

    console.log('【对阵结束】', '开始...');
    r = await exec('role/chapter/challenge/finish', {battleid: r.battleid}).catch(e => e);
    isok = !!r.result;
    util.assert(isok, '对阵结束', r, util.timer());

    console.log('【征战收益】', '开始...');
    r = await exec('role/chapter/reap', {}).catch(e => e);
    isok = !!r.items;
    util.assert(isok, '征战收益', r, util.timer());

}
