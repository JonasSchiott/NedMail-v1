module.exports = class Queue {
	constructor() {
		this._processing = false;
		this._queue = [];
	}

	get length() {
		return this._queue.length;
	}

	async add(promiseFunc) {
		this._queue.push(promiseFunc);
		if (!this._processing) await this._process();
	}

	async _process() {
		this._processing = true;
		const promiseFunc = this._queue.shift();

		if (promiseFunc) {
			try {
				await promiseFunc();
			} catch (error) {
				console.error(error);
			} finally {
				await this._process();
			}
		} else {
			this._processing = false;
		}
	}
};
