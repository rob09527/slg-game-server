
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.role.calTowerToken();
	ctx.body = ctx.role._towertoken;
}