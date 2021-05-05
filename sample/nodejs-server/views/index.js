var socket = io()

$('input[name="url"]').on('paste', function(e) {
	setTimeout(() => {
		$('form:has(input[name="url"])').submit();
	}, 0)
})

$('form:has(input[name="url"])').on('submit', function(e) {
	e.preventDefault()
	var input = $('input[name="url"]')
	input.prop('disabled', true);
	socket.emit('urlUpload', $('input[name="url"]').val(), () => {
		input.prop('disabled', false)
		this.reset()
		input.focus()
	});
})

$('input[name="files"]').on('change', function(e) {
	
	var input = e.target;
	var $input = $(e.target);
	
	var formData = new FormData();
	for(file of input.files) console.log(file), formData.append('files', file);
	formData.append('id', socket.id);
	
	input.disabled = true;
	
	
	fetch('http://localhost/files', {
		method: 'POST',
		body: formData
	}).then(res => {
		input.disabled = false;
		input.value = '';
	});
});
// $('form:has(input[name="file"])').on('submit', function(e) {
	// e.preventDefault()
	// var input = $('input[name="file"]')
	// input.prop('disabled', true);
	
	// socket.emit('fileUpload', $('input[name="file"]').val(), () => {
		// input.prop('disabled', false)
		// this.reset()
		// input.focus()
	// });
// })

var reloadOutputTable = async () => {
	
	var parent = $('#outputTable')[0];
	
	var res = await fetch('table');
	var json = await res.json();
	
	function createCard(name) {
		
		var a = document.createElement('a');
		var div = document.createElement('div');
		var video = document.createElement('video');
		var p = document.createElement('p');
		
		a.classList.add('card');
		a.classList.add('text-center');
		a.classList.add('bg-secondary');
		a.classList.add('w-25');
		a.classList.add('m-4');
		a.href = `mp4/${name}`;
		div.classList.add('card-boty');
		video.classList.add('w-100');
		video.src = `mp4/${name}`;
		p.classList.add('card-text');
		p.classList.add('text-white');
		p.textContent = name;
		div.appendChild(video);
		div.appendChild(p);
		a.appendChild(div);
		
		return a;
	}
	
	parent.innerHTML = '';
	for(e of json) {
		parent.appendChild(createCard(e));
	}
	
};

reloadOutputTable();

socket.on('success', msg => {
	alertify.success(msg)
	reloadOutputTable();
}).on('error', msg => {
	alertify.error(msg)
}).on('warning', msg => {
	alertify.warning(msg)
}).on('message', msg => {
	alertify.message(msg)
})