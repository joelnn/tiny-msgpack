'use strict';
var ExtBuffer = require('./ext-buffer');

function Codec() {
	if (!(this instanceof Codec)) {
		throw new TypeError('Codecs must be constructed with the "new" keyword.');
	}
	this._packers = [];
	this._packerClasses = [];
	this._unpackers = {};
}
Codec.prototype.addPacker = function (etype, Class, packer) {
	if (Array.isArray(packer)) {
		packer = join(packer);
	}
	this._packers.push(function (value) {
		return new ExtBuffer(packer(value), etype);
	});
	this._packerClasses.push(Class);
	return this;
};
Codec.prototype.addUnpacker = function (etype, unpacker) {
	this._unpackers[etype] = Array.isArray(unpacker) ? join(unpacker) : unpacker;
	return this;
};
Codec.prototype.getPacker = function (value) {
	return getPacker(value.constructor, this._packerClasses);
};
Codec.prototype.getUnpacker = function (type) {
	return this._unpackers[type];
};
module.exports = Codec;

// This is isolated for optimization purposes.
var getPacker = function (constructor, classes) {
	for (var i=0, len=classes.length; i<len; ++i) {
		if (constructor === classes[i]) {
			return this._packers[i];
		}
	}
};

var join = function (filters) {
	filters = filters.slice();
	var iterator = function (value, filter) {
		return filter(value);
	};
	return function (value) {
		return filters.reduce(iterator, value);
	};
};
