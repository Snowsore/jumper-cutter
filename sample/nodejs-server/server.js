#!/usr/bin/env node

// JumperCutter Server

require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const fetch = require('node-fetch');
const jumperCutter = require('./jumper_cutter');
const path = require('path');
const {spawn} = require('child_process');


app.set('view engine', 'pug');
app.use(express.json());
app.use('/node_modules', express.static(`node_modules`));
app.use('/mp4', express.static('mp4'));

io.on('connection', socket => {
	socket.emit('message', 'Welcome to JumperCutter')
	
	socket.on('urlUpload', async (url, fn) => {
		fn()
		
		var file = await jumperCutter.downloadVideo(url, (filename) => {
			socket.emit('warning', 'Job start\n' + filename)
		});

		var video = {
			name: file,
			source: `uploads/${file}`,
			target: `mp4/${file}`
		};
		
		jumperCutter.render(video, msg => {
			socket.emit('warning', msg);
		}).then(msg => {
			socket.emit('success', msg);
		}).catch(msg => {
			socket.emit('error', msg);
		});
	})

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/table', (req, res) => {
	var dir = fs.readdirSync('mp4')
	res.json(dir);
});

app.post('/files', upload.array('files'), (req, res) => {
	for(file of req.files) {
		
		var video = {
			name: file.originalname,
			source: `uploads/${file.filename}`,
			target: `mp4/${file.originalname}`
		};
		
		jumperCutter.render(video, msg => {
			io.to(req.body.id).emit('warning', msg);
		}).then(msg => {
			fs.unlinkSync(video.source);
			io.to(req.body.id).emit('success', msg);
		}).catch(msg => {
			io.to(req.body.id).emit('error', msg);
		});
	}

	res.json({
		msg: 'Upload successful'
	});
});

http.listen(process.env.PORT, () => {
	console.log(`Server start at ${process.env.PORT}`);
});
