'use strict'

/**
 * 
 * @param {*} ids  需要给角色新增fid
 * @param {*} fid    
 */
module.exports = async function (ids, fid) {
    for (let id of ids) {
        const roles = await global.dao.role.updateOne({ _id: id }, { $set: { fid } });
    }
}
