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
		if (wavesurfer.getCurrentTime() > 0) {
			return Math.floor((100 / wavesurfer.getDuration()) * wavesurfer.getCurrentTime());
		}
	}

	function initWavesurfer($element) {
		var url = $element.data('url');
		wavesurfer.load(url);
	}

	function play(){
		wavesurfer.play();

		$btnPlay.addClass('hidden');
		$btnPause.removeClass('hidden');

		updateDisplayTime();
	}

	/*
	 *  With WaveSurfer
	 */
	var wavesurfer = WaveSurfer.create({
		container: '#waveform',
		height: 80,
		barWidth: 1
	});

	wavesurfer.load('media/mihai-pol-goneta.wav');

	wavesurfer.on('ready', function() {
		$btnPlay.on('click', function() {
			play();
		});

		$btnPause.on('click', function() {
			wavesurfer.pause();

			$btnPause.addClass('hidden');
			$btnPlay.removeClass('hidden');
		});

		$btnStop.on('click', function() {
			wavesurfer.stop();

			$btnPause.addClass('hidden');
			$btnPlay.removeClass('hidden');

			updateDisplayTime();
		});

		$btnNext.on('click', function() {
			wavesurfer.stop();

			$activeTrack = $activeTrack.next();
			if ($activeTrack.next().length == 0) {
				$activeTrack = $playlistItems.first();
			}

			initWavesurfer($activeTrack);
			play();
		});

		$btnPrev.on('click', function() {
			wavesurfer.stop();

			$activeTrack = $activeTrack.prev();
			if ($activeTrack.length == 0) {
				$activeTrack = $playlistItems.last();
			}

			initWavesurfer($activeTrack);
			play();
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


/*
 *  Audio Player
 */
// $(function(){
// function initAudio($element) {
// 	audio = new Audio(['media/mihai-pol-goneta.ogg', 'media/mihai-pol-goneta.mp3']);
//
// 	$('#audio-player #playlist li.active').removeClass('active');
// 	$element.addClass('active');
//
// 	$currentTime.fadeOut(400);
// 	if (!audio.currentTime) {
// 		$currentTime.html('0.00');
// 	}
//
// 	audio.addEventListener("loadeddata", function() {
// 		$duration.html(timecode(audio.duration));
// 		initAnalyser();
// 		timeout = audio.duration / 0.8;
// 	});
//
// 	audio.volume = 1;
//
// 	/* for other functions */
// }
//
// initAudio($activeTrack);
//
// /*
//  *  Helper functions
//  */
// function timecode(ms) {
// 	var hms = {
// 		h: Math.floor(ms / (60 * 60 * 1000)),
// 		m: Math.floor((ms / 60000) % 60),
// 		s: Math.floor((ms / 1000) % 60)
// 	};
//
// 	var time = [];
//
// 	if (hms.h > 0) {
// 		time.push(hms.h);
// 	}
//
// 	time.push((hms.m < 10 && hms.h > 0) ? '0' + hms.m : hms.m);
// 	time.push(hms.s < 10 ? "0" + hms.s : hms.s);
//
// 	return time.join('.');
// }
//
// function updateDisplayTime() {
// 	$(audio).bind('timeupdate', function() {
// 		$currentTime.html(timecode(audio.currentTime));
// 		$progress.css('width', getProgress(audio.duration, audio.currentTime) + '%');
// 	});
// }
//
// function getProgress() {
// 	if (audio.currentTime > 0) {
// 		return Math.floor((100 / audio.duration) * audio.currentTime);
// 	}
// }
//
// function initAndPlay($element) {
// 	initAudio($element);
// 	audio.play();
// 	updateDisplayTime();
// }
// 	$btnPlay.on('click', function() {
// 		audio.play();
//
// 		$btnPlay.addClass('hidden');
// 		$btnPause.removeClass('hidden');
//
// 		updateDisplayTime();
// 	});
//
// 	$btnPause.on('click', function() {
// 		audio.pause();
//
// 		$btnPause.addClass('hidden');
// 		$btnPlay.removeClass('hidden');
// 	});
//
// 	$btnStop.on('click', function() {
// 		audio.pause();
// 		audio.currentTime = 0;
//
// 		$btnPause.addClass('hidden');
// 		$btnPlay.removeClass('hidden');
//
// 		updateDisplayTime();
// 	});
//
// 	$btnNext.on('click', function() {
// 		audio.pause();
//
// 		$activeTrack = $activeTrack.next();
// 		if ($activeTrack.next().length == 0) {
// 			$activeTrack = $playlistItems.first();
// 		}
//
// 		initAndPlay($activeTrack);
// 	});
//
// 	$btnPrev.on('click', function() {
// 		audio.pause();
//
// 		$activeTrack = $activeTrack.prev();
// 		if ($activeTrack.length == 0) {
// 			$activeTrack = $playlistItems.last();
// 		}
//
// 		initAndPlay($activeTrack);
// 	});
//
// 	$playlistItems.on('click', function() {
// 		audio.pause();
// 		initAndPlay($(this));
// 	});
//
// 	$volume.on('change', function() {
// 		audio.volume = parseFloat($volume.val() / 10);
// 	});
//
// 	$progressBar.on('click', function() {
// 		var mouseX = event.pageX - $progress.offset().left,
// 			progressPercentage = Math.round(mouseX / $progressBar.width() * 100 * 100) / 100,
// 			progressTime = progressPercentage / 100 * audio.duration;
//
// 		audio.currentTime = Math.round(progressTime);
// 		$progress.css('width', progressPercentage + '%');
// 		$currentTime.html(audio.currentTime);
// 	});
// });

//  TODO
//  shuffle playlist


// $('#vol').slider( {
// 	value : audio.volume*100,
// 	slide : function(ev, ui) {
// 		$('#vol').css({background:"hsla(180,"+ui.value+"%,50%,1)"});
// 		audio.volume = ui.value/100;
// 	}
// });

