// 数据统计单元测试
module.exports = async (exec, role, util) => {
    util.timer();
    console.log('【日报统计】', '开始...');
    const body = {
        date: '2021-09-05'
    };
    await require('../src/schedule/shapshoot_for_dally').main(body);
    util.assert(1, '日报统计', "1", util.timer());

    console.log('【LTV统计】', '开始...');

    await require('../src/schedule/shapshoot_for_ltv').main(body);
    util.assert(1, 'LTV统计', "1", util.timer());

}
