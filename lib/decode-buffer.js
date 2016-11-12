'use strict';

function DecodeBuffer(codec) {
	this.codec = codec;
}
DecodeBuffer.prototype.push = Array.prototype.push;
DecodeBuffer.prototype.read = Array.prototype.shift;
DecodeBuffer.prototype.append = function (chunk) {
	var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
	this.buffer = prev ? Buffer.concat([prev, chunk]) : chunk;
	this.offset = 0;
};
module.exports = DecodeBuffer;
