
'use strict'

/*
	角色数据不在此方法中保存,执行方法后再自行保存
*/

const _conds = require('./exec_conditions');
const random = require('./../random');
const assert = require('assert');

module.exports = exports = (role, exid, times) => {
	times = parseInt(times) || 1;
	const rule = global.execrules[exid];
	assert(rule, 'invalid rule');
	let items = [], castitems = [];
	let items_bymail = [];

	// 没有条件，也没有随机掉落组，则进行一次逻辑执行
	if (!(rule.REQUIRE && rule.REQUIRE.length > 0) && !rule.PROBTO && !rule.SPECIALREQUIRE) {
		if (rule.FROM) {
			castitems.append(rule.FROM.map(t => ({
				GSID: t.GSID || t.gsid, COUNT: (t.COUNT || t.count) * times
			})));
		}

		if (rule.TO) {
			items.append(rule.TO.map(t => ({ GSID: t.GSID || t.gsid, COUNT: (t.COUNT || t.count) * times })))
		}
		role.addItemsNoSave(items);
		role.castItemsNoSave(castitems);
		// 单独针对 装备宝箱兑换优化
		return { items, castitems, items_bymail };
	}

	for (let i = 0; i < times; i++) {
		if (rule.REQUIRE) {
			for (let req of rule.REQUIRE) {
				let flags = [];
				const count = role.getProp(req.GSID);
				if (typeof req.COUNT === 'number') flags.push(count == req.COUNT);
				if (typeof req.MINCOUNT === 'number') flags.push(count >= req.MINCOUNT);
				if (typeof req.MAXCOUNT === 'number') flags.push(count <= req.MAXCOUNT);
				if (Array.isArray(req.IN)) flags.push(req.IN.includes(count)); // 增加一个包含条件
				if (typeof req.POS === 'number') flags.push((0x00000001 & (count >> (req.POS - 1))) !== 1);

				if (req.PARAM) {
					let cond = _conds[req.GSID];
					assert(cond, 'cond nexist');
					flags.push(cond.apply(null, [role].append(req.PARAM)));
				}
				assert(flags.every(f => f), 'not satisfi');
			}
		}
		if (rule.FROM) {
			role.castItemsNoSave(rule.FROM);
			castitems.append(rule.FROM);
		}
		let tmp = [];
		if (rule.PROBTO) {
			let prob = global.probs[rule.PROBTO];
			if (!prob) {
				throw new Error('MISS PROB:' + rule.PROBTO + ' FROM ' + exid);
			}
			const num = random.between(prob.COUNTAREA.MIN, prob.COUNTAREA.MAX);
			assert(num <= prob.PROB.length, 'probconfig err0');
			prob = prob.PROB;
			const rates = prob.deepMap('RATE');
			let tmp_prob = [];
			while (tmp_prob.length < num) {
				let item = prob[random.inweight(rates)];
				assert(item, 'random err');
				item = item.GOT.map(function (i) {
					return { GSID: i.GSID, COUNT: random.between(i.MINCOUNT, i.MAXCOUNT) };
				})
				tmp_prob.append(item);
			}
			tmp.append(tmp_prob);
		}
		if (rule.SPECIALREQUIRE) {
			for (let sp of rule.SPECIALREQUIRE) {
				if (sp.PARAM) {
					const cond = _conds[sp.GSID];
					assert(cond, 'cond nexist');
					let flag = cond.apply(null, [role].append(sp.PARAM));
					if (!flag) continue;
				} else {
					if (role.getItems(sp.GSID).count != sp.COUNT) continue;
				}
				tmp = tmp.append(sp.BAGMARK);
			}
		}
		if (rule.TO) tmp = tmp.append(rule.TO);
		if (rule.MAILTO) items_bymail.append(rule.MAILTO);
		items = items.append(tmp);
	}
	role.addItemsNoSave(items);	// save after cast
	castitems = castitems.arrange();
	items = items.arrange();
	return { items, castitems, items_bymail };
}
