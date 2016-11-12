'use strict';
var BufferUtil = require('./buffer-util');
var MIN_BUFFER_SIZE = 2048;
var MAX_BUFFER_SIZE = 65536;

var CodecBuffer = function (codec) {
	this.codec = codec;
};
CodecBuffer.prototype.push = function (chunk) {
	var buffers = this.buffers || (this.buffers = []);
	buffers.push(chunk);
};
CodecBuffer.prototype.read = function () {
	this.flush();
	var buffers = this.buffers;
	if (buffers) {
		var chunk = buffers.length > 1 ? BufferUtil.concat(buffers) : buffers[0];
		buffers.length = 0;
		return chunk;
	}
};
CodecBuffer.prototype.flush = function () {
	if (this.start < this.offset) {
		this.push(this.buffer.slice(this.start, this.offset));
		this.start = this.offset;
	}
};
CodecBuffer.prototype.reserve = function (length) {
	if (!this.buffer) {
		return this.alloc(length);
	}
	var size = this.buffer.length;
	// Does it need to be resized?
	if (this.offset + length > size) {
		// Flush current buffer.
		this.offset && this.flush();
		// Resize it to 2x current length.
		this.alloc(Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE)));
	}
};
CodecBuffer.prototype.alloc = function (length) {
	this.setBuffer(new Uint8Array(Math.max(length, MIN_BUFFER_SIZE)));
};
CodecBuffer.prototype.setBuffer = function (buffer) {
	this.buffer = buffer;
	this.offset = 0;
	this.start = 0;
};
CodecBuffer.prototype.send = function (buffer) {
	var end = this.offset + buffer.length;
	if (this.buffer && end <= this.buffer.length) {
		buffer.copy(this.buffer, this.offset);
		this.offset = end;
	} else {
		this.flush();
		this.push(buffer);
	}
};
module.exports = CodecBuffer;
