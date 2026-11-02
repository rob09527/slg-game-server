'use strict'
const assert = require("assert");
/**
 * 角色道具发放
 * @example // 其他实例服执行示例
 *          const res = await global.remote.agent_prop_add({_id: rid}, 38001, 100); // 需加 agent_ 前缀
 * @param roleinfo {{_id?: string, uid?: string, rno?: number, servid?: number}}
 * @param gsid {number}
 * @param count {number}
 */
module.exports = async function (roleinfo, gsid, count, reason = 'GM_SEND',time) {
    count = parseInt(count);

    const role = await global.dao.role.findOne(roleinfo);
    assert(role, 'err role');
    role._path_ = reason;
    if (time) {
		time = new Date(time).getTime()
		// 头像框增加时间专用
		const frameConfig = global.gameconfig.frame;
		let _frames = role._frames || {};
		let top1frameInfo = frameConfig[gsid];
		if (top1frameInfo) {
		_frames[gsid] = time;
		await global.dao.role.updateOne({servid:role.servid,uid:role.uid},{$set:{_frames}});
		}
        console.log(role.uid, role.rno, role.servid, 'ADD', gsid, 1, new Date().format(), 1, role._path_);
		return {
			_frames
		}
	}
    const before = role.getItems(gsid).count;
    let fn = 'addItemsNoSave';
    if (count < 0) fn = 'castItemsNoSave';
    count = Math.abs(count);
    role[fn]({gsid: gsid, count: count}, 'manual')
    await role.save();
    const after = role.getItems(gsid).count;
    console.log('MANUAL ADD', role.uid, role.servid, gsid, count, reason);
    return {before: before, after: after};
}
