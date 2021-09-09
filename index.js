///////////// modules
// express
const express = require('express');
const app = express();
app.use(express.json());
// env
//require('dotenv').config();
// twitter
const Twitter = require('twitter');
const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});
// deta
const { Deta } = require('deta');
const deta = Deta(process.env.DETA_BASE_KEY);
const game = deta.Base('game');
// node sheduler
const schedule = require('node-schedule');
var cron_ex = '00 */10 * * * *';
// next cell module
const findNextCell = require('./findNextCell');
////////// global canvas constands
const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const n = 6,
      s = n * 50,
      canvas = createCanvas(2*s, s),
      ctx = canvas.getContext('2d');
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

/////////////// random apple generator
const random = () => {
    return [(Math.floor((Math.random() * 5) + 1)), (Math.floor((Math.random() * 5) + 1))];
};
const checkColllision = (body, apple) => {
    console.log(apple);
    let collided = false;
    for (part of body){
        if ((part[0] === apple[0]) && (part[1] === apple[1])){
            collided = true;
            break;
        };
    };
    if(collided){
        checkColllision(body, random());
    } else{
        return apple;
    };
};
const randomApple = (body) => {
    return checkColllision(body, random());
};
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//////////// post game to twitter
function postGame(media_b64, text, snake, apple, score, h_score, dead){
    console.log('Triying to post to to twitter.');
    // post media to twitter db
    client.post("media/upload", { media_data: media_b64 }, (error, media, response) => {
        if (error){
            console.log("Can't post image: ", JSON.stringify(error));
        } else {
            console.log("Media uploaded..");
            // post tweet status to twitter
            client.post("statuses/update", { status: text, media_ids: media.media_id_string }, (error, tweet, response) => {
                if (error){
                    console.log("Error posting status: ", JSON.stringify(error));
                } else {
                    console.log("status upadated...");
                    if (dead){
                        let data = {
                                "key": 'game_data_key',
                                "snake": [[2,2,2],[1,2,2],[0,2,2]],
                                "apple": randomApple([[2,2,2],[1,2,2],[0,2,2]]),
                                "last_post_id": "",
                                "score": 0,
                                "h_score": 0
                        };
                        game.put(data).then((result) => {
                            console.log('Base updated succesfully.', result);
                        }).catch((error) => console.error('Error posting to base', error));
                    } else {
                        let data = {
                                "key": 'game_data_key',
                                "snake": snake,
                                "apple": apple,
                                "last_post_id": tweet.id_str.toString(),
                                "score": score,
                                "h_score": h_score
                            };
                        game.put(data).then((result) => {
                            console.log('Base updated succesfully.', result);
                        }).catch((error) => console.error('Error posting to base', error));
                    };
                };
            });
        };
    });
};
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


////////// game processor function
function processGame(snake = [], apple = [], rts, loves, score, h_score){
    // analyse game
    console.log('...analysis starting...');
    let dir = 0;
    if (rts > loves){
        dir = -1;
    } else if (loves > rts){
        dir = 1;
    } else if (loves == rts){
        dir = 0;
    };
    console.log('Direction taken: ', dir);
    let newSnake = [],
        newApple = [],
        ate = false,
        died = false,
        nextCell = findNextCell(dir, snake[0]);
    console.log('Next cell: ', nextCell);
    // collision with apple
    if ((nextCell[0] === apple[0]) && (nextCell[1] === apple[1])) ate = true;
    // apple gen
    let newScore, new_h_score;
    if (ate){
        newApple = randomApple(newSnake);
        newScore += 1;
        if (newScore > h_score){
            new_h_score = newScore;
        } else {
            new_h_score = h_score;
        };
    };
    if (!ate){
        snake.pop();
        newApple = apple;
        newScore = score;
        new_h_score = h_score;
    };
    // snake growing
    newSnake = [nextCell, ...snake];
    // collision with body
    newSnake.forEach(part => {
        if ((nextCell[0] === part[0]) && (nextCell[1] === part[1])){
            died = true;
        };
    });

    ////////////////////////////////////////
    // draw game
    console.log('...starts to draw...');
    // bg
    ctx.fillStyle = '#242424cc';
    ctx.fillRect(0, 0, 2*s, s);
    for (let j = 0; j < n; j++){
        for (let i = 0; i < n; i++){
            if (((i+j) % 2) === 0){
                ctx.fillStyle = '#8aa8a3';
            } else {
                ctx.fillStyle = '#5a6b68';
            };
            ctx.fillRect(i*50, j*50, 50, 50);
        };
    };
    // snake
    let lightness = 45;
    for (let i = 0; i < newSnake.length; i++){
        let x = newSnake[i][0] * 50,
            y = newSnake[i][1] * 50,
            hsl = `hsl(100, 100%, ${lightness}%)`;
        ctx.fillStyle = '#062400d5';
        ctx.fillRect(x, y, 50, 50);
        ctx.fillStyle = hsl;
        lightness += (25 / newSnake.length);
        ctx.fillRect(x + 2, y + 2, 46, 46);
    };
    let x = newSnake[0][0] * 50,
        y = newSnake[0][1] * 50,
        to = newSnake[0][2];
    ctx.fillStyle = "#000";
    if (to === 0){
        ctx.fillRect(x, y + 10, 10, 10);
        ctx.fillRect(x, y + 30, 10, 10);
    } else if (to === 1){
        ctx.fillRect(x + 10, y, 10, 10);
        ctx.fillRect(x + 30, y, 10, 10);
    } else if (to === 2){
        ctx.fillRect(x + 40, y + 10, 10, 10);
        ctx.fillRect(x + 40, y + 30, 10, 10);
    } else if (to === 3){
        ctx.fillRect(x + 10, y + 40, 10, 10);
        ctx.fillRect(x + 30, y + 40, 10, 10);
    };
    // apple
    ctx.fillStyle = '#000000cb';
    ctx.fillRect(newApple[0]*50, newApple[1]*50, 50, 50);
    ctx.fillStyle = "#ff0000cb";
    ctx.font = "35px monospace";
    ctx.fillText("🍎", newApple[0]*50 + 3, newApple[1]*50 + 38);
    // write tweets and love counts
    ctx.fillStyle = '#525252';
    ctx.fillRect(s, 0.66*s, s, 0.34*s);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("LAST  POST  GOT", s + 15, 0.7*s + 20);
    ctx.fillText(`${loves}  LIKES  AND`, s + 15, 0.7*s + 45);
    ctx.fillText(`${rts}  RETWEETS.`, s + 15, 0.7*s + 70);
    ctx.fillStyle = "#ffe600d7";
    ctx.font = "50px Arial";
    ctx.fillText("🐓", 2*s - 90, s - 35);
    // classifieds drawing
    let ad = new Image();
    ad.onload = () => ctx.drawImage(ad, s, 0, s, 0.66*s);
    ad.src = '/engi.png'
    console.log('...drawing complete...');
    ////////////////////////////////////////

    // formulate text for tweet....
    let post_text = "NOW SNAKE ATE " + newScore + " APPLES AND HIGHEST EATEN IS " + new_h_score + " APPLES";

    // result obj
    console.log('PROCESS RESULTS: ', {
        "media_b64": canvas.toBuffer().toString('base64'),
        "text": post_text,
        "snake": newSnake,
        "apple": newApple,
        "ate": ate,
        "dead": died,
        "h_score": new_h_score,
        "score": newScore
    });
    //postGame(media_b64, text, snake, apple, score, h_score, dead, res);
    postGame(canvas.toBuffer().toString('base64'), post_text, newSnake, newApple, newScore, new_h_score, died);
};
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


//////////////////// inint fn...
function initUpdate(){
    console.log('Updation initiated.');
    // get data from deta base...
    game.get('game_data_key').then(result => {
        console.log('Got game data from base.');
        let snake = result.snake,
            apple = result.apple,
            score = result.score,
            h_score = result.h_score,
            post_id = result.last_post_id;
        console.log("Snake: ", snake, `\t`, 'Apple: ', apple);
        if (post_id === ""){
            // start of new game
            console.log('Start of new game.');
            processGame(snake, apple, 0, 0, 0, 0);
        } else {
            // get data from twitter...
            console.log('Contacting twitter for last post statistics.');
            client.get('statuses/show', { id: post_id }, function(err, data, response){
                if (err){
                    console.log('Error getting statistics: ', JSON.stringify(err));
                } else {
                    console.log('Got last post statistics...');
                    let rts = data.retweet_count,
                        loves = data.favorite_count;
                    processGame(snake, apple, rts, loves, score, h_score);
                };
            });
        };
    }).catch((error) => console.error('Error posting to base', error));
};
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

// cron job
const job = schedule.scheduleJob(cron_ex, function(){
    initUpdate();
});

// app routes
app.get('/', (req, res) => {
    res.send('SERVER IS OK');
});

app.listen(3000, () => console.log('LISTENING @ :3000'));
initUpdate();