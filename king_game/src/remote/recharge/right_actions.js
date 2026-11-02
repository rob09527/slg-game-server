
'use strict';

const ACTIONS = ['yd', 'gz', 'zz', 'zk', 'mopup'];

module.exports = exports = ({prefix}) =>{
	if (ACTIONS.includes(prefix)) return require('./act_right_'+prefix);
}