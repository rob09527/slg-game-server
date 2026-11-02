
'use strict';

const dobattle = require('./dobattle');
const ROUND_TYPE = require('./bconfig/typeround.json');

exports.main_handler = async (event, context, callback) => {
	let {function_version, request_id} = context;
	let {requestContext: {stage}} = event;
	// console.log('stage:', stage);
	// console.log('function_version:', function_version);
	let {player, enemy, seed, type, season, lcards, rcards} = JSON.parse(event.body);
	// console.log('version:', 1004);
	// console.log(type);
	// console.log(seed);
	// console.log(season);
	// console.log(lcards);
	// console.log(rcards);
	// console.log(JSON.stringify(player));
	// console.log(JSON.stringify(enemy));
	let round = ROUND_TYPE[type] || 3600;
	const ret = dobattle(seed, player, enemy, round, season, lcards, rcards, type);
	ret.reqid = request_id;
  return ret;
};