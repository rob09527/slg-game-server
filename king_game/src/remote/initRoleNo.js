'use strict'

module.exports = async function () {
    let maxrno = await global.dao.role.find({}, {_id: 0, rno: 1}).sort({rno: -1}).limit(1);
    if (maxrno.length < 1) {
        maxrno = 1200010;
    } else {
        maxrno = maxrno[0].rno;
    }
    return await global.dao.counter.init('rno', maxrno);
}
