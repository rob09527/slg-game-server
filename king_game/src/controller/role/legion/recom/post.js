
'use strict'

const RANGES = [
	{num: 2, r: [0, 1]},
	{num: 1, r: [1, 2]},
	{num: 2, r: [2, 3]},
];
const LEN = 7;
module.exports = exports = async (ctx, next) =>{
	let list = [];
	let defaultMatch = {
		servid: {
			$in: ctx.role._gameserv.group_sid_list
		}
	};

	let top = await ctx.dao.legion.findOne(defaultMatch).select('_exp').sort({_exp: -1}).limit(1);
	top = top || {};
	let {_exp: exp_top = 0} = top;
	for (let {num, r} of RANGES) {
		let [min, max] = r;
		min = exp_top * (min / 3);
		max = exp_top * (max / 3);
		let cond = {
			_exp: {
				$gte: min,
				$lte: max,
			},
			...defaultMatch
		}
		let legions = await ctx.dao.legion.find(cond).select('_exp lastactive _members').sort({lastactive: -1});
		legions = legions.map(function (doc) {
			return {
				_id: doc._id,
				lv: doc.level,
				ava: doc.mpnum - doc._members.length,
				last: doc.lastactive,
			}
		})
		legions.sort(function (pre, nxt) {
			if (pre.ava > 0 && nxt.ava <= 0) return  1;
			if (pre.ava <= 0 && nxt.ava > 0) return -1;
			return 0;
		})
		legions.shuffle();
		legions = legions.slice(0, num);
		list.append(legions);
	}
	ctx.body = {legionlist: []};
	for (let {_id} of list) {
		let doc = await ctx.dao.legion.findOne({_id});
		ctx.assert(doc, 'invalid legion');
		// 去重
		let result = ctx.body.legionlist.find(item => item._id ==doc._id);
		if (!result) continue;
		ctx.body.legionlist.push(doc);
	}
	ctx.body.legionlist = await ctx.dao.legion.bindInfo(ctx.body.legionlist, ctx.role.i());
	let del = LEN - ctx.body.legionlist.length;
	if (del < 1) return;
	let excludes = ctx.body.legionlist.map(legion =>{
		return legion.id;
	})
	let cond = {
		_id: {
			$nin: excludes,
		},
		...defaultMatch
	}
	del = await ctx.dao.legion.find(cond).sort({lastactive: -1});//.limit(del);
	if (del.length > LEN) {
		let arr = [];
		while(arr.length < LEN) {
			let pos = Math.floor(Math.random() * del.length);
			if (del[pos]) {
				arr.push(...del.splice(pos,1));
			}
		}
		del = arr;
	}
	del = await ctx.dao.legion.bindInfo(del, ctx.role.i());
	ctx.body.legionlist.push(...del);
}
