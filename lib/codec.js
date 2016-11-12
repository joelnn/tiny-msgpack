'use strict';
var ExtBuffer = require('./ext-buffer');

function Codec() {
	if (!(this instanceof Codec)) {
		throw new TypeError('Codecs must be constructed with the "new" keyword.');
	}
	this._packers = {};
	this._unpackers = [];
}
Codec.prototype.addPacker = function(etype, Class, packer) {
	if (Array.isArray(packer)) {
		packer = join(packer);
	}
	var name = Class.name;
	if (name && name !== 'Object') {
		this._packers[name] = extPacker;
	} else {
		var list = this.extEncoderList || (this.extEncoderList = []);
		list.unshift([Class, extPacker]);
	}
	
	function extPacker(value) {
		var buffer = packer(value);
		return new ExtBuffer(buffer, etype);
	}
};
Codec.prototype.addUnpacker = function(etype, unpacker) {
	this._unpackers[etype] = Array.isArray(unpacker) ? join(unpacker) : unpacker;
};
Codec.prototype.getPacker = function(value) {
	var c = value.constructor;
	var e = c && c.name && this._packers[c.name];
	if (e) return e;
	var list = this.extEncoderList;
	if (!list) return;
	var len = list.length;
	for (var i = 0; i < len; i++) {
		var pair = list[i];
		if (c === pair[0]) return pair[1];
	}
};
Codec.prototype.getUnpacker = function(type) {
	return this._unpackers[type] || extUnpacker;
	
	function extUnpacker(buffer) {
		return new ExtBuffer(buffer, type);
	}
};
module.exports = Codec;

function join(filters) {
	filters = filters.slice();
	
	return function(value) {
		return filters.reduce(iterator, value);
	};
	
	function iterator(value, filter) {
		return filter(value);
	}
}
