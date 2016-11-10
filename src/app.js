var Smooth = require('./smooth.js')

var smooth = document.querySelector('main')
var app = new Smooth(smooth, {
    direction: 'horizontal',
    stageAnimation: 'rightIn'
})