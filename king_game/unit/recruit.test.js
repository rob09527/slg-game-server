// 酒馆功能测试
module.exports = async (exec, role, util) => {
    let r;
    let isok;

    util.timer();
    console.log('【酒馆单抽】', '开始...');
    r = await exec('role/recruit', {times: 1}).catch(e => e);
    isok = r.generals && r.generals.length;
    util.assert(isok, '酒馆单抽', r, util.timer());


    console.log('【酒馆十连】', '开始...');
    r = await exec('role/recruit', {times: 10}).catch(e => e);
    isok = r.generals && r.generals.length;
    util.assert(isok, '酒馆十连', r, util.timer());

}
