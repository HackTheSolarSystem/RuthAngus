var baseurl = {{ site.baseurl }}

particlesJS.load('top', baseurl + '/public/particlesjs-config.json', function () {
	console.log('callback - particles.js config loaded');
});