
'use strict';

const doBattle = require('./dobattle');
const ROUND_TYPE = require('./bconfig/typeround.json');

const fs = require('fs');
let [, , , type, seed, player, enemy, hps] = process.argv;
player = JSON.parse(player);
if (typeof hps === 'string') process.argv[7] = JSON.parse(hps);
const params = process.argv.slice(6);
params.unshift(type);
enemy = require('./convert/modteam').apply(null, params);
let round = ROUND_TYPE[type] || 3600;
const ret = doBattle(seed, player, enemy, round);
console.log('|finial|'+JSON.stringify(ret));