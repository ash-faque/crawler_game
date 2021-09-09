const express = require("express");
const app = express();

let c = 0;

app.get('/', (req, res) => {
	res.setHeader('Content-type: image/png');
	res.send(canvas.toBuffer());
});
app.get('/t', (req, res) => {
	res.send('Myru');
});
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

const draw = () => {
	ctx.clearRect(0, 0, 200, 200)
	// Write "Awesome!"
	ctx.font = '20px Impact'
	ctx.fillStyle = ctx.strokeStyle = 'red'
	ctx.fillText('Awesome!', 20, 80)
	// Draw line under text
	var text = ctx.measureText('Awesome!')
	ctx.beginPath()
	ctx.lineTo(50, 102)
	ctx.lineTo(50 + text.width, 102)
	ctx.stroke()
	ctx.closePath()
	ctx.fillText(c, 80, 160)
};

// node sheduler
const schedule = require('node-schedule');
const job = schedule.scheduleJob('*/10 * * * * *', function(){
	console.log('c = ', c);
	draw(c);
	c++
});

app.listen(3000, () => console.log(`App is listening...`));