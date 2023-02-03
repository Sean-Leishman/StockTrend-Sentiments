import type { PageServerLoad } from './$types';
import { parse } from 'csv-parse';
import axios from 'axios';
import yahooFinance from 'yahoo-finance2';
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { fromEnv } from "@aws-sdk/credential-provider-env"
import { S3Client, GetObjectCommand, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { KinesisClient, PutRecordsCommand } from "@aws-sdk/client-kinesis";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AWS_ACCESS_KEY_ID_ROOT, AWS_SECRET_ACCESS_KEY_ROOT } from '$env/static/private'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set the AWS Region.
const REGION = "us-east-2";

// Set the Amazon Kinesis Service object.
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

const get_key = async (bucketName: string, stockName: string) => {
  console.log(bucketName)
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
          if (stockName == ""){
            return max_val.Key.slice(0,max_val.Key.lastIndexOf('/')+1);
          } 
          else{
            return max_val.Key.slice(0,max_val.Key.lastIndexOf('/')+1) + stockName;
          }
        }
      }
    } catch (err) {
      console.log("Error", err);
  }
}

const get_stock_data = async () => {
  const key = await get_key('stocks-data-328','');
  const bucketParams = {
      Bucket: 'stocks-data-328',
      Key: key
  }
  try {
      const data = await s3Client.send(new GetObjectCommand(bucketParams));
      if (data.Body){
        const stream = await data.Body.transformToString();
        let stocks = JSON.parse(stream)
        return stocks; // For unit tests.
      }
    } catch (err) {
      //throw new Error(err)
    }
}

export const load = (async ({ params }) => {
    
  //let data = await parser();
  console.log(params)
  return {
    post: {
      data: await get_stock_data()
    }
  };
}) satisfies PageLoad;