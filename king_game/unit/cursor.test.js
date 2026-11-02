const roleCursor = require('../src/util/cursor');
const sleep = t => new Promise(resolve => setTimeout(resolve, t))
// 游标工具测试
module.exports = async (exec, role, util) => {
    await roleCursor(global.dao.role.find({}, {rno: 1, uid: 1, servid: 1}).sort({servid: -1}), async (role, index) => {
        console.log('ROLE ', index, role.rno, role.uid, role.servid)
        await sleep(10);
    })
}
