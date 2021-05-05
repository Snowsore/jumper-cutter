// Nodejs JumperCutter module

const {spawn} = require('child_process');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

const fs = require('fs');

// const { io } = require('socket.io-client');

// spawn('python', [
	// './python/server.py',
	// 'localhost',
	// 8080
// ], {
	// stdio: [process.stdin, process.stdout, process.stderr]
// });

// var socket = io('ws://localhost:8080');
// socket.emit('my_message', {
	// msg: 'fuckme',
	// id: 1
// });

function wait(n) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, n);
	});
}

function createRender(source, target) {
	return new Promise((resolve, reject) => {
		spawn('python', ['./python/jc2mp4.py', source, target], {stdio: [process.stdin, process.stdout, process.stderr]}
		).on('exit', code => {
			if(code) reject(code);
			else resolve(code);
		});
	});
}

module.exports = {
	async render(file, start) {
		await lock.acquire('render', async () => {
			try {
				setTimeout(() => start(`Job start\n ${file.name}`), 1);
				await createRender(file.source, file.target);
			} catch(e) {
				throw `Job failed\n ${file.name}`;
			}
		});
		return `Job done\n ${file.name}`;
	},
	downloadVideo(url, cb) {
		return new Promise((resolve, reject) => {
			
			var fileName = `${Date.now()}.mp4`;
			
			cb(fileName);
			
			spawn('ffmpeg', [
				'-i',
				url,
				'-c:v',
				'copy',
				`uploads/${fileName}`
			]).on('exit', code => {
				if(code) reject(fileName);
				resolve(fileName);
			})
			
		});
	}
}