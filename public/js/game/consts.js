var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 400;

var UI_TOP_GAP = 50;
var UI_BOTTOM_GAP = 80;

var SINE_ANIMATION_HEIGHT = 8;

var STAR_COUNT = 8;
var STAR_MARGIN = 15;
var STAR_RADIUS_MIN = 10;
var STAR_RADIUS_MAX = 60;
var STAR_RADIUS_RANGE = STAR_RADIUS_MAX - STAR_RADIUS_MIN;
var STAR_FREQUENCY_MIN = 100;
var STAR_FREQUENCY_MAX = 1000;
var STAR_FREQUENCY_RANGE = STAR_FREQUENCY_MAX - STAR_FREQUENCY_MIN;

var STAR_GRADIENTS = [
	[ "#f6d365", "#fda085" ],
	[ "#fccb90", "#d57eeb" ],
	[ "#a1c4fd", "#c2e9fb" ],
	[ "#d4fc79", "#96e6a1" ],
	[ "#84fab0", "#8fd3f4" ],
	[ "#a18cd1", "#fbc2eb" ],
	[ "#fad0c4", "#ffd1ff" ]
];

var PROBE_WIDTH = 40;
var PROBE_HEIGHT = 40;
var PROBE_COUNT_MAX = 4;

var RESEARCH_COUNT_MAX = 2;

var STATE_PROBE = 0;
var STATE_GUESS = 1;
