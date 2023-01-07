import {EventListener} from 'yuuko';

function joinUnjoinedThreads (threads, myThreadMembers) {
	const joinedThreadIDs = myThreadMembers.map(member => member.threadID);
	threads
		.filter(thread => !joinedThreadIDs.includes(thread.id))
		.forEach(thread => thread.join().catch(() => {}));
}

export default [
	// When the bot starts, scan all known threads and join those we're not in
	new EventListener('ready', ({client}) => {
		client.guilds.forEach(async guild => {
			const {threads, members} = await guild.getActiveThreads();
			joinUnjoinedThreads(threads, members);
		});
	}, {once: true}),
	// When we gain access to new channels, join any newly visible threads
	new EventListener('threadListSync', (guild, deletedThreads, activeThreads, myThreadMembers) => {
		joinUnjoinedThreads(activeThreads, myThreadMembers);
	}),
	// When we see a new thread created, join it
	new EventListener('threadCreate', async thread => {
		await thread.join();
	}),
];
