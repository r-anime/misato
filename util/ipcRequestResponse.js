// This module provides tools for working with request/response structured IPC
// between Node child processes created via `child_process.fork()`.From any
// process, call `wrapProcess` and pass any other process. You can then send
// requests to that process and listen for incoming requests from that process.

const EventEmitter = require('events');

// Stores information for each process that's had an IPC created for it. Ensures
// that multiple calls to wrapProcess won't mess things up.
const processes = {};

function wrapProcess (targetProcess) {
	if (processes[targetProcess.pid]) {
		return processes[targetProcess.pid];
	}

	const ipc = new EventEmitter();

	// A map of messageID => resolveFunction for sent requests awaiting responses.
	const pendingRequests = {};

	// Listens for incoming messages if a listener doesn't already exist on this process
	targetProcess.on('message', message => {
		const {messageID, type, data} = message;
		if (type === 'response') {
			// Handle responses by resolving/rejecting the corresponding promise
			const {resolve, reject} = pendingRequests[messageID];
			delete pendingRequests[messageID];
			const {success, error} = data;
			if (error) {
				return reject(new Error(error));
			}
			return resolve(success);
		} else if (type === 'request') {
			// Handle new requests by emitting an event, passing the request
			// data, a resolve callback, and a reject callback
			ipc.emit('request', data, success => targetProcess.send({
				type: 'response',
				messageID,
				data: {
					success,
				},
			}), error => targetProcess.send({
				type: 'response',
				messageID,
				data: {
					error,
				},
			}));
		}
	});

	// Sends a request to the target process. Returns a `Promise` that resolves
	// with the data the process sends in response.
	ipc.request = data => new Promise((resolve, reject) => {
		const messageID = Date.now() + Math.random();
		// We don't actually resolve or reject the promise now, but we save
		// those functions with the messageID so we can retrieve and call them
		// once the target process actually responds
		pendingRequests[messageID] = {resolve, reject};
		targetProcess.send({
			type: 'request',
			messageID,
			data,
		});
	});

	// Sends a one-off message that doesn't expect a response. Returns nothing.
	ipc.send = data => {
		targetProcess.send({
			type: 'single',
			data,
		});
	};

	processes[targetProcess.pid] = ipc;
	return ipc;
}

module.exports = {
	wrapProcess,
};
