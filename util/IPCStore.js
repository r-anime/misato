// A session storage privider that delegates all actual storage to a real store
// available on another process via child_process IPC.

const ipcRequestResponse = require('./ipcRequestResponse');

module.exports = ({Store}) => class IPCStore extends Store {
	constructor (options = {}) {
		super(options);
		this.target = ipcRequestResponse.wrapProcess(options.targetProcess || process);
	}

	// Public API
	// see http://expressjs.com/en/resources/middleware/session.html#session-store-implementation

	all (callback) {
		this.target.request({
			type: 'sessionStoreAll',
		}).then(data => callback(null, data)).catch(error => callback(error, null));
	}

	destroy (sid, callback) {
		this.target.request({
			type: 'sessionStoreDestroy',
			sid,
		}).then(_ => callback(null)).catch(error => callback(error));
	}

	clear (callback) {
		this.target.request({
			type: 'sessionStoreClear',
		}).then(_ => callback(null)).catch(error => callback(error));
	}

	length (callback) {
		this.target.request({
			type: 'sessionStoreLength',
		}).then(data => callback(null, data)).catch(error => callback(error, null));
	}

	get (sid, callback) {
		this.target.request({
			type: 'sessionStoreGet',
			sid,
		}).then(data => callback(null, data)).catch(error => callback(error, null));
	}

	set (sid, session, callback) {
		this.target.request({
			type: 'sessionStoreSet',
			sid,
			session,
		}).then(data => callback(null, data)).catch(error => callback(error, null));
	}

	touch (sid, session, callback) {
		this.target.request({
			type: 'sessionStoreTouch',
			sid,
			session,
		}).then(data => callback(null, data)).catch(error => callback(error, null));
	}
};

// Listen for IPCStore messages in a given process and carry them out on the
// provided database-backed store.
module.exports.linkIPCStore = (clientProcess, store) => {
	const targetIPC = ipcRequestResponse.wrapProcess(clientProcess);
	targetIPC.on('request', (data, resolve, reject) => {
		const {type, sid, session} = data;
		function callback (error, success) {
			if (error) return reject(error);
			return resolve(success);
		}
		if (type === 'sessionStoreAll') {
			store.all(callback);
		} else if (type === 'sessionStoreDestroy') {
			store.destroy(sid, callback);
		} else if (type === 'sessionStoreClear') {
			store.clear(callback);
		} else if (type === 'sessionStoreLength') {
			store.length(callback);
		} else if (type === 'sessionStoreGet') {
			store.get(sid, callback);
		} else if (type === 'sessionStoreSet') {
			store.set(sid, session, callback);
		} else if (type === 'sessionStoreTouch') {
			store.touch(sid, session, callback);
		}
	});
};
