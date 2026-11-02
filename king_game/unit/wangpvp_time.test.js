// 王战时间测试
module.exports = async (exec, role, util) => {
    let r;
    let isok;

    util.timer();
    console.log('时间获取', '开始...');
    r = await exec('role/wangpvp/pvp/info', {}).catch(e => e);
    isok = !!r.time
    util.assert(isok, '时间获取', r, util.timer());

}
