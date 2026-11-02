
/**
 * 游标操作工具封装
 * @param findCursor {mongoose.Cursor}
 * @param fn
 * @example util.cursor(global.dao.role.find({}, {rno: 1}), async(role)=>{ @DO_YOUR })
 * @return {Promise<void>}
 */
module.exports = async function (findCursor, fn) {

    const cursor = findCursor.cursor();
    let role;
    let index = 0;
    while (role = await cursor.next()) {
        await fn(role, index);
        index++;
    }
    cursor.close();
}
