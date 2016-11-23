/*
 *   Audio Player jQuery Plugin
 *   Author: Mihai Pol
 *   Copyright (c) 2016
 */

$(function() {
	var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;
	var timeout, startTime = 0;
	var urlToSave;
	var token;
	var analyserArray = '';

	/*
	 *  Global Variables
	 */
	var audio,
		$btnPlay = $('#audio-player #play'),
		$btnPause = $('#audio-player #pause'),
		$btnStop = $('#audio-player #stop'),
		$btnNext = $('#audio-player #next'),
		$btnPrev = $('#audio-player #prev'),
		$currentTime = $('#audio-player #current-time'),
		$duration = $('#audio-player #duration'),
		$playlistItems = $('#audio-player #playlist li'),
		$activeTrack = $playlistItems.first(),
		$volume = $('#audio-player #volume'),
		$progress = $('#audio-player #progress'),
		$progressBar = $('#audio-player #progress-bar');

	function initAudio($element) {
		audio = new Audio($element.data('url'));

		$('#audio-player #playlist li.active').removeClass('active');
		$element.addClass('active');

		$currentTime.fadeOut(400);
		if (!audio.currentTime) {
			$currentTime.html('0.00');
		}

		audio.addEventListener("loadeddata", function() {
			$duration.html(timecode(audio.duration));
			initAnalyser();
			timeout = audio.duration / 0.8;
		});

		audio.volume = 1;

		/* for other functions */
	}

	initAudio($activeTrack);

	/*
	 *  Helper functions
	 */
	function timecode(ms) {
		var hms = {
			h: Math.floor(ms / (60 * 60 * 1000)),
			m: Math.floor((ms / 60000) % 60),
			s: Math.floor((ms / 1000) % 60)
		};

		var time = [];

		if (hms.h > 0) {
			time.push(hms.h);
		}

		time.push((hms.m < 10 && hms.h > 0) ? '0' + hms.m : hms.m);
		time.push(hms.s < 10 ? "0" + hms.s : hms.s);

		return time.join('.');
	}

	function updateDisplayTime() {
		$(audio).bind('timeupdate', function() {
			$currentTime.html(timecode(audio.currentTime));
			$progress.css('width', getProgress(audio.duration, audio.currentTime) + '%');
		});
	}

	function getProgress() {
		if (audio.currentTime > 0) {
			return Math.floor((100 / audio.duration) * audio.currentTime);
		}
	}

	function initAndPlay($element) {
		initAudio($element);
		audio.play();
		updateDisplayTime();
	}

	/*
	 *  Audio Player
	 */
	$btnPlay.on('click', function() {
		audio.play();

		$btnPlay.addClass('hidden');
		$btnPause.removeClass('hidden');

		updateDisplayTime();

		audio.playbackRate = 4;

		/* for other functions */
		urlToSave = $(this).data('url');
		token = $(this).data('token');
		// ANIMATION
		// frameLooper();
	});

	$btnPause.on('click', function() {
		audio.pause();

		$btnPause.addClass('hidden');
		$btnPlay.removeClass('hidden');
	});

	$btnStop.on('click', function() {
		audio.pause();
		audio.currentTime = 0;

		$btnPause.addClass('hidden');
		$btnPlay.removeClass('hidden');

		updateDisplayTime();

		/* for other functions */
		/// ANALYZER
		analyser.disconnect();
		source.disconnect();
		// this.stopped = true;
	});

	$btnNext.on('click', function() {
		audio.pause();

		$activeTrack = $activeTrack.next();
		if ($activeTrack.next().length == 0) {
			$activeTrack = $playlistItems.first();
		}

		initAndPlay($activeTrack);
	});

	$btnPrev.on('click', function() {
		audio.pause();

		$activeTrack = $activeTrack.prev();
		if ($activeTrack.length == 0) {
			$activeTrack = $playlistItems.last();
		}

		initAndPlay($activeTrack);
	});

	$playlistItems.on('click', function() {
		audio.pause();
		initAndPlay($(this));
	});

	$volume.on('change', function() {
		audio.volume = parseFloat($volume.val() / 10);
	});

	$progressBar.on('click', function() {
		var mouseX = event.pageX - $progress.offset().left,
			progressPercentage = Math.round(mouseX / $progressBar.width() * 100 * 100) / 100,
			progressTime = progressPercentage / 100 * audio.duration;

		audio.currentTime = Math.round(progressTime);
		$progress.css('width', progressPercentage + '%');
		$currentTime.html(audio.currentTime);

	});

	/*
	 *  Animation Bar
	 */
	function initAnalyser() {
		context = new AudioContext(); // AudioContext object instance
		analyser = context.createAnalyser(); // AnalyserNode method
		canvas = document.getElementById('analyser_render');
		ctx = canvas.getContext('2d');
		// Re-route audio playback into the processing graph of the AudioContext
		source = context.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(context.destination);
	}


	function frameLooper() {
		setTimeout(function() {
			if (audio.ended) {
				console.log(analyserArray);
				$.ajax({
					method: 'post',
					url: urlToSave,
					data: {
						array: analyserArray,
						_token: token
					}
				})
					.done(function(msg) {
						alert('DONE');
					})
				return;
			}
			if (audio.paused) {
				return;
			}
			window.requestAnimationFrame(frameLooper);
			fbc_array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(fbc_array);
			ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
			ctx.fillStyle = '#00CCFF'; // Color of the bars
			bars = 100;
			s = 0;
			for (var i = 0; i < bars; i++) {
				bar_x = i * 3;
				bar_width = 2;
				bar_height = -(fbc_array[i] / 2);
				//  fillRect( x, y, width, height ) // Explanation of the parameters below
				ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
				s += fbc_array[i];
			}
			var arithmetic = s / 100;
			arithmetic *= arithmetic / 100;
			// if (arithmetic > 100) {
			// 	if (arithmetic > 80) {
			// 		arithmetic *= arithmetic/100;
			// 	}
			// }
			// else {
			// 	arithmetic *= 0.6;
			// }
			console.log(arithmetic);
			analyserArray += ' ' + String(arithmetic);
			startTime += timeout;
		}, timeout);
	}

	var wavesurfer = WaveSurfer.create({
		container: '#waveform',
		height: 80,
		barWidth: 1
	});

	wavesurfer.load('media/mihai-pol-goneta.mp3');
	wavesurfer.on('ready', function() {
		$btnPlay.on('click', function() {
			audio.play();
			wavesurfer.play();

			$btnPlay.addClass('hidden');
			$btnPause.removeClass('hidden');

			updateDisplayTime();

			audio.playbackRate = 1;

			/* for other functions */
			// ANIMATION
			// frameLooper();
		});


		$btnPause.on('click', function() {
			audio.pause();
			wavesurfer.pause();

			$btnPause.addClass('hidden');
			$btnPlay.removeClass('hidden');
		});

		$progressBar.on('click', function() {
			var mouseX = event.pageX - $progress.offset().left,
				progressPercentage = Math.round(mouseX / $progressBar.width() * 100 * 100) / 100,
				progressTime = progressPercentage / 100 * audio.duration;

			audio.currentTime = Math.round(progressTime);
			$progress.css('width', progressPercentage + '%');
			$currentTime.html(audio.currentTime);

			wavesurfer.seekTo(progressPercentage / 100);

		});
	});


	// Fast forwards the audio file by 30 seconds.
	function forwardAudio() {

		// Check for audio element support.
		if (window.HTMLAudioElement) {
			try {
				var oAudio = document.getElementById('myaudio');
				oAudio.currentTime += 30.0;
			}
			catch (e) {
		// Fail silently but show in F12 developer tools console
				if (window.console && console.error("Error:" + e));
			}
		}
	}
});

//  TODO
//  shuffle playlist


// $('#vol').slider( {
// 	value : audio.volume*100,
// 	slide : function(ev, ui) {
// 		$('#vol').css({background:"hsla(180,"+ui.value+"%,50%,1)"});
// 		audio.volume = ui.value/100;
// 	}
// });

