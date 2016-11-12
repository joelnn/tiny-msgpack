'use strict';
var uint8 = require('./read-format').uint8;
var token = require('./read-token');

module.exports = function (decoder) {
	var type = uint8(decoder);
	var func = token[type];
	if (!func) {
		throw new Error('Invalid type: ' + (type ? ('0x' + type.toString(16)) : type));
	}
	return func(decoder);
};
