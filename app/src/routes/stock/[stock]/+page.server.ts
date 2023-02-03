import type { PageServerLoad } from './$types';
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { S3Client, GetObjectCommand, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { KinesisClient, PutRecordsCommand } from "@aws-sdk/client-kinesis";
import { TwitterApi } from 'twitter-api-v2';

import { type TweetV2, type TTweetv2Expansion, type Tweetv2FieldsParams } from 'twitter-api-v2';
import { formatMetric } from '$lib/functions/utils';
import { TWITTER_BEARER_TOKEN,AWS_ACCESS_KEY_ID_ROOT, AWS_SECRET_ACCESS_KEY_ROOT } from '$env/static/private'

const date = new Date();

type Params = {
  'expansions': TTweetv2Expansion,
  'tweet.fields': string,
  'user.fields':string
}


/*
const twitterClient = new TwitterApi(process.env.__TWITTER_BEARER_TOKEN__!); // The base twitter client
const roClient = twitterClient.readOnly; // A read only twitter client
const expansions: TTweetv2Expansion = 'author_id'
let options: Params
options = {
  'expansions': expansions,
  'tweet.fields': 'created_at',
  'user.fields':'profile_image_url'
} 
*/
const options = '&expansions=author_id,attachments.media_keys,referenced_tweets.id&tweet.fields=public_metrics,created_at&user.fields=profile_image_url'

const fetchTweetsInternal = async (tweetIds: string[]) => {
  //const response = await roClient.v2.tweets(tweetIds, options); // fetch our tweets
  //return response.data; // We only care about tweets that are successfully loadedconst options = '&expansions=author_id&tweet.fields=public_metrics,created_at&user.fields=profile_image_url'

  const response = await fetch(
    `https://api.twitter.com/2/tweets/?ids=${tweetIds.join(',')}${options}`,
    { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } }
  )
  const body = await response.json()
  const tweets = body.data.map((t) => {
    const author = body.includes.users.find((a) => a.id === t.author_id)
    const image = body.includes.media[0];
    return {
      id: t.id,
      text: t.text,
      createdAt: new Date(t.created_at).toLocaleDateString('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      metrics: {
        replies: formatMetric(t.public_metrics?.reply_count ?? 0),
        likes: formatMetric(t.public_metrics?.like_count ?? 0),
        retweets: formatMetric(t.public_metrics?.retweet_count ?? 0),
        impressions: formatMetric(t.public_metrics?.impressions ?? 0),
      },
      author: {
        name: author.name,
        username: author.username,
        profileImageUrl: author.profile_image_url,
      },
      attatchments: {
        url: image.media_key
      },
      url: `https://twitter.com/${author.username}/status/${t.id}`,
    }
  })

  return tweets
};

// Set the AWS Region.
const REGION = "us-east-2";

const kinesisClient = new KinesisClient({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_ROOT,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_ROOT
  }
});

const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID_ROOT,
      secretAccessKey: AWS_SECRET_ACCESS_KEY_ROOT
    }
})

// CHANGE WAY TO GET KEYS FOR BUCKET GATHERED FROM ML (last modified)
const get_key = async (bucketName: string, stockName: string) => {
  console.log(bucketName)

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
          if (stockName == ""){
            return max_val.Key.slice(0,max_val.Key.lastIndexOf('/')+1);
          }
          else{
            const key = max_val.Key.slice(0,max_val.Key.lastIndexOf('/')+1) + stockName
            if (data.Contents.map(k => k.Key).includes(key)){
              return key;
            }
            else{
              return "";
            }

            return ;
          }
        }
      }
    } catch (err) {
      console.log("Error", err);
  }
}

const get_tweets = async (data: any, stockName: string) => {
  const tweetids = data.id
  return await fetchTweetsInternal(tweetids.slice(0,20));
}

const get_ml_data = async (stockName: string) => {
  const key = await get_key('twitter-sentiments-analysis-326', stockName);
  const bucketParams = {
      Bucket: 'twitter-sentiments-analysis-326',
      Key: key
  }
  console.log(bucketParams,'y')
  try{
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    if (data.Body){
      const stream = await data.Body.transformToString();
      try {
        const tweets = await get_tweets(JSON.parse(stream), stockName)
        let obj = {'stream':JSON.parse(stream), 'updated':key?.substring(0,key?.lastIndexOf("/")),'tweets':tweets}
        return obj
      }
      catch (err) {
        console.log("Error6", err);
        return {'stream':JSON.parse(stream), 'tweets':[]}
      }
      ; // For unit tests.
    }
  }
  catch (err) {
    return {'stream':{"probabilities":[],"positive_count":0, "negative_count":0}, 'tweets':[]}
  }
  
}

const get_stock_data = async (stockName: string) => {
  const key = await get_key('stocks-data-328','');
  const bucketParams = {
      Bucket: 'stocks-data-328',
      Key: key
  }
  try {
      const data = await s3Client.send(new GetObjectCommand(bucketParams));
      if (data.Body){
        const stream = await data.Body.transformToString();
        let stock = JSON.parse(stream)
        for (let s of stock){
          if (s.symbol === stockName){
            return s
          }
        }
        return stock[0]; // For unit tests.
      }
    } catch (err) {
      console.log("Error6", err);
    }
}

export const load = (async ({ params }) => {
    //let data = await parser();
    return {
      post: {
        data: await get_ml_data(params.stock),
        stockData: await get_stock_data(params.stock),
      }
    };
  }) satisfies PageLoad;