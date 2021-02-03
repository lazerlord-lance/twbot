require("dotenv").config();
const twit = require("./twit");
const fs = require("fs");
const path = require("path");
const paramsPath = path.join(__dirname, 'params.json')


function writeParams(data) {
    console.log('Writing params file: ', data)
    return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

function readParams() {
    console.log('Reading params');
    const data = fs.readFileSync(paramsPath);
    return JSON.parse(data.toString());
}

function getTweets(since_id) {
    return new Promise((resolve, reject) => {
        let params = {
            q: 'Ehre Schere',
            count: 10
        };
        if(since_id) {
            params.since_id = since_id;
        }
        console.log("We are getting the tweets...", params);
        twit.get("search/tweets", params, (err, data) => {
            if(err) {
                return reject(err);
            } 
            return resolve(data);
        });
    });
}

function postRetweet(id) {
    return new Promise((resolve, reject) => {
        let params = {
            id,
        };
        twit.post('statuses/retweet/:id', params, (err, data) => {
            if(err) {
                return reject(err);
            }
            return resolve(data);
        })
    })
}


async function main() {
    try {
        const params = readParams();
        const data = await getTweets(params.since_id);
        const tweets = data.statuses;
        console.log('We got the twits', tweets.length);
        for await(let tweet of tweets) {
            try {
                //await postRetweet(tweet.id_str);
                console.log('Successful ' + tweet.id_str);
            } catch(e) {
                console.error('Unsuccessful ' + tweet.id_str);
            }
            params.since_id = tweet.id_str;
        }
        writeParams(params);
    } catch(e) {
        console.error(e);
    }
}

console.log('Starting the twitter bot...', twit);

setInterval(main, 10000)