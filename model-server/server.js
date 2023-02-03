import express from "express";
import cors from "cors";
import axios from "axios";
import needle from "needle";

import yahooFinance from 'yahoo-finance2';

import dotenv from 'dotenv'
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { S3Client, GetObjectCommand, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { KinesisClient, PutRecordsCommand } from "@aws-sdk/client-kinesis";

import { spawn } from 'child_process';
import { ruleExtractor, symbols, names } from './utils.js'; 
dotenv.config();

const app = express();
const port = 4000;

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

// Set the AWS Region.
const REGION = "us-east-2";

// Set the Amazon Kinesis Service object.
const kinesisClient = new KinesisClient({
  region: REGION,
  credentials: fromIni({profile: 'default'}),
});

const s3Client = new S3Client({
    region: REGION,
    credentials: fromIni({profile: 'default'})
})

const bucketConfig = {
    Bucket: "twitter-bucket-sentiments-325"
}

const newDate = new Date();

// Create rules 
const rules = ruleExtractor()

app.use(cors()) 

app.get('/get-tweets', (request,response) => {
    console.log(request.query.query)
    axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
        params: {
            query: `(${request.query.query}) lang:en -is:retweet`,
            max_results: 100,
        },
        headers: {
            'Authorization': `Bearer ${process.env.__TWITTER_BEARER_TOKEN__}`,
        },
    }).then((res) => {
        //console.log(res.data) KDS-S3-xovS2-1-2023-01-07-13-05-24-60315732-af56-4a94-9d7c-617abf4f1e87
        //                      KDS-S3-xovS2-1-2023-01-07-12-57-06-dc7339a3-b201-4170-8d3d-0c27bb8c9337
        response.send(res.data)
    }).catch((err) => {
        console.log(err)
        console.log("error")
    })
})

async function getAllRules() {

    const response = await needle('get', rulesURL, {
        headers: {
            "authorization": `Bearer ${process.env.__TWITTER_BEARER_TOKEN__}`
        }
    })

    if (response.statusCode !== 200) {
        console.log("Error:", response.statusMessage, response.statusCode)
        throw new Error(response.body);
    }

    console.log("response", response.body)

    return (response.body);
}

async function deleteAllRules(rules) {

    if (!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map(rule => rule.id);

    const data = {
        "delete": {
            "ids": ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${process.env.__TWITTER_BEARER_TOKEN__}`
        }
    })
    console.log(rules, response.body, "DELTE")
    if (response.statusCode !== 200) {
        throw new Error(response.body);
    }

    return (response.body);

}

async function setRules() {
    const data = {
        "add": rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            'Authorization': `Bearer ${process.env.__TWITTER_BEARER_TOKEN__}`,
        },
    })
    if (response.statusCode !== 201){
        console.log("here")
        console.log(response.body, response.body.errors[0].details, response.statusCode)
        throw new Error(response);
    }   

    else{
        console.log("set", response.body)
        return response.body
    }
    
}
let recordData = [];
let tweetIds = [];

const connectStream = (retryAttempt) => {
    const fields = {
        expansions: "author_id",
        'user.fields': "public_metrics"
    }
    const stream = needle.request('get', streamURL, fields, {
        headers: {
            "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${process.env.__TWITTER_BEARER_TOKEN__}`
        },
        timeout: 20000
    });

    let key = newDate.getFullYear()+"/"+(newDate.getMonth()+1)+"/"+newDate.getDate();

    stream.on('data', data => {
        //console.log("CALLED")
        try {
            const json = JSON.parse(data);
            if (!tweetIds.includes(json.data.id)){
                if (json.includes.users[0].public_metrics.followers_count > 1000){
                    console.log(json, json.includes.users.map(a => a.public_metrics), "yo", json.includes.users[0], "yo2", json.includes.users[0].public_metrics.followers_count)
                    tweetIds.push(json.data.id);
                    recordData.push(json)
                }
                
            }
            // A successful connection resets retry count.
            retryAttempt = 0;
        } catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log("some1",data.detail)
                process.exit(1)
            } else {
                // Keep alive signal received. Do nothing.
            }
        }
        setInterval(() => {
            if (recordData.length < 10){
                
            }
            else{
                console.log(recordData, recordData.length)
                //console.log(recordData, recordData.length)
                //uploadData();
                upload_tweets_to_s3('twitter-bucket-sentiments-325', key, recordData);
                recordData = [];
            }
        }, 10000)

    }).on('err', error => {
        if (error.code !== 'ECONNRESET') {
            console.log(error.code);
            process.exit(1);
        } else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream. 
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...")
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });
    console.log("DONE")
    return stream

}

app.get('/connect-stream', (req, res) => {
    console.log("connected")
    let currentRules; 

    async function ex() {
        try{
            currentRules = await getAllRules();
    
            await deleteAllRules(currentRules);
    
            await setRules()
    
        } catch(e) {
            console.error(e);
        }
        connectStream(0)
    }
    ex();
})

const uploadData = async () => {
    try {
      console.log(recordData.length)
      const data = await kinesisClient.send(new PutRecordsCommand({
        Records: recordData,
        StreamName: 'twitter-sentiment-analysis' // For example, 'my-stream-kinesis'.
      }));
      //console.log('data', data);
      //console.log("Kinesis updated", data);
    } catch (err) {
      console.log("Error", err);
    }
  };

const upload_tweets_to_s3 = async (bucketName, key, tweets) => {
    try{
        const data = await s3Client.send(new GetObjectCommand({Bucket: `${bucketName}`, Key: `${key}`}));
        let json_data = JSON.parse(await data.Body.transformToString())
        /* console.log(json_data)
        const fdata = Object.keys(json_data).forEach((k,i) => {
            console.log(json_data[k])
            json_data[k] = json_data[k].concat(tweets[i])
        }) */
        const fdata = json_data.concat(tweets)
        console.log([...new Set(fdata.map((item) => item.data.id))].length, fdata.length)
        try{
            const final = await s3Client.send(new PutObjectCommand({Bucket: `${bucketName}`, Key: `${key}`, Body: JSON.stringify(fdata)}))
        } catch (err) {
            console.log(err)
            throw new Error
        }
    } catch (err1) {
        try{
            console.log("error 1", err1)
            const final = await s3Client.send(new PutObjectCommand({Bucket: `${bucketName}`, Key: `${key}`, Body: JSON.stringify(tweets)}))
        } catch (err2) {
            console.log(err2)
            throw new Error
        }
    }
}       

const get_key = async (bucketName, stockName) => {
    let offset = 1;
    if (stockName == ""){
        offset = 0
    }
    try {
        const data = await s3Client.send(new ListObjectsCommand({Bucket: `${bucketName}`}));
        if (data.Contents){
            //return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+"6"+"/"+"11"
            //return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+"/"+stockName
            const last_modified = data.Contents.map(k => {
                if (k.LastModified){
                    return new Date(k.LastModified).getTime()
                }
                return new Date('December 17, 1995 03:24:00').getTime()
            })
            const max_val = data.Contents[last_modified.indexOf(Math.max(...last_modified))];
            console.log(max_val);
            if (max_val.Key){
                //return max_val.Key.slice(0,max_val.Key.lastIndexOf('/')+offset) + stockName;
                return max_val.Key;
            }
        }
        } catch (err) {
        console.log("Error", err);
    }
}

const get_data = async (bucket, stockName) => {
    const key = await get_key(bucket, stockName);
    const bucketParams = {
        Bucket: bucket,
        Key: key
    }
    console.log(bucketParams)
    try {
        const data = await s3Client.send(new GetObjectCommand(bucketParams));
        const stream = await data.Body.transformToString();
        //console.log("stream", stream)
        return stream; // For unit tests.
      } catch (err) {
        throw new Error(err)
    }
}

const upload_ml_data_to_s3 = async(bucket, data) => {
    //const key = await get_key(bucket);
    const date = new Date();
    const key = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+"/"
    const bucketParams = {
        Bucket: bucket,
        Key: key+data['subject'],
        Body: JSON.stringify(data)
    }
    console.log(bucketParams)
    try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams))
    } catch (err) {
        throw new Error
    }
}

const upload_stock_data = async(bucket) => {
  
    let data = await yahooFinance.quote(symbols, {
        fields: ["symbol", "displayName", "regularMarketPrice", "regularMarketChange", "regularMarketChangePercent",
    "marketCap", "region", "regularMarketDayHigh", "regularMarketDayLow", "regularMarketOpen", "trailingPE",
"regularMarketVolume", "shortName", "longName"]
    })
    const date = new Date();
    data['updatedAt'] = Date.now();
    const key = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()
    const bucketParams = {
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(data)
    }
    try {
        const data = await s3Client.send(new PutObjectCommand(bucketParams))
        console.log(key, data)
    } catch (err) {
        throw new Error
    }
}

app.get('/upload-stock-data', (req,res) => {
    upload_stock_data('stocks-data-328')
})

// CHECK DUPLICATES
// SPLIT DATA INTO TEXT, MATCHING TEXTS BEFORE CHECKING ON MODEL
// GET PAST SEVEN DAYS OF DATA ??? 
app.get('/download-data', (req,res) => {
    let value = [];
    (async () => {
        let data = await get_data("twitter-bucket-sentiments-325", "");
        data.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        let dataf = JSON.parse(data)
        let obj = create_structure(dataf, symbols, names)
        for (let subject of Object.keys(obj)){
            let val = JSON.stringify({
                "id": obj[subject]['id'],
                "text": obj[subject]['text'],
            })
            let temp = await call_model(val)
            temp['subject'] = subject
            temp = add_fields(temp);
            value.push(temp)
            upload_ml_data_to_s3("twitter-sentiments-analysis-326", temp)
        }
        console.log("ERR", value)
        res.send(value)
        //call_model(json);
    })();
})

const add_fields = (data) => {
    data['count'] = data['sentiment'].length 
    data['positive_count'] = data['sentiment'].filter(s => s === 'POSITIVE').length
    data['negative_count'] = data['sentiment'].filter(s => s === 'NEGATIVE').length
    return data
}

const create_structure = (data, symbols, names) => {
    let obj = {}
    let i = 0 
    for (let symbol of symbols){
        console.log(symbol, names[i], "DATA", data)
        obj[symbol] = {};
        obj[symbol]['id'] = data.filter(d => d.data.text.includes(symbol) || d.data.text.includes(names[i])).map(obj => obj.data.id)
        obj[symbol]['text'] =  data.filter(d => d.data.text.includes(symbol) || d.data.text.includes(names[i])).map(obj => obj.data.text.replace(/[\n\r\t]/g))
    }
    return obj 
}

const call_model = async (json) => {
    const response = await axios.post('http://127.0.0.1:8000/predict',
        json,
        {
            headers:{
                'accept': 'applicaton/json',
                'Content-Type': 'application/json'
            }
        }
    )
    return response.data
};


app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})

