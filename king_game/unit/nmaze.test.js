// 新远征测试
module.exports = async (exec, role, util) => {
    let r;
    let isok;

    util.timer();

    console.log('【刷新远征】', '开始...');
    r = await exec('role/nmaze/info', {force: 1}).catch(e => console.error(e) || e);
    isok = !!r.mapid;
    // console.log(r);
    util.assert(isok, '刷新远征', r, util.timer());


}
