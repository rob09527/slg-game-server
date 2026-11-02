
'use strict';

const os = require('os');

const [, , _port] = process.argv
const port = _port || (os.type() == 'Darwin' ? 8082 : 80);

const ROUND_TYPE = require('./bconfig/typeround.json');
const dobattle = require('./dobattle');

const express = require('express');

let app = express();
let bodyParser = require('body-parser');

app.use(require('cors')());
// post body解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/:env/battlelogic', function (req, res) {
	// console.log('version:', 1004);
	let { player, enemy, seed, type, season, lcards, rcards, zhenfapos } = req.body;
	// console.log(type);
	// console.log(seed);
	// console.log(season);
	// console.log(JSON.stringify(player));
	// console.log(JSON.stringify(enemy));
	// console.log(lcards);
	// console.log(rcards);
	// console.log(zhenfapos);
	// console.log("fighting!!!");
	let round = ROUND_TYPE[type] || 3600;
	const ret = dobattle(seed, player, enemy, round, season, lcards, rcards, type);
	res.json(ret);
})

app.post('/test/battlelogic', function (req, res) {
	// console.log('version:', 1004);
	let { player, enemy, seed, type, season, lcards, rcards, zhenfapos } = req.body;
	// console.log(type);
	// console.log(seed);
	// console.log(season);
	// console.log(JSON.stringify(player));
	// console.log(JSON.stringify(enemy));
	// console.log(lcards);
	// console.log(rcards);
	// console.log(zhenfapos);
	// console.log("fighting!!!");
	let round = ROUND_TYPE[type] || 3600;
	const ret = dobattle(seed, player, enemy, round, season, lcards, rcards, type);
	res.json(ret);
})

app.listen(port);
console.log('listen at', port, '...', Date.now());