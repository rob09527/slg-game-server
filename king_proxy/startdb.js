
'use strict'

const debug = require('debug')('kaihei:launcher:startdb');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

module.exports = exports = function (dbconf) {
	const {
		NAME,
		AUTH,
		HOST = 'localhost',
		PORT = 27017,
	} = dbconf;
	let DOMAIN = HOST + ':' + PORT;
	let db_auth = '';
	let query = [];
	if (AUTH) {
		const {
			USER,
			PWD,
			SOURCE,
			RSNAME,
		} = AUTH;
		db_auth = USER + ':' + PWD + '@';
		if (SOURCE) query.push('authSource=' + SOURCE);
		if (RSNAME) {
			DOMAIN = HOST;
			query.push('replicaSet=' + RSNAME)
		}
	}

	if (query.length > 0) query = '?' + query.join('&');
	const url = `mongodb://${db_auth}${DOMAIN}/${NAME}${query}`;

	debug(url);

	return mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
}
