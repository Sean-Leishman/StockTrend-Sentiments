# Stock-Sentiment-Analysis
Source code for StockTrend website that uses tweets for sentiment analysis of stocks. The webpage is run using SvelteKit and is deployed on Netlify. The backend data of the app 
is gathered from an Amazon S3 bucket and as such any installations of this repository would require you to set up your own AWS account and to also gather the relevant data.

The model and server is run from the model-server folder which uses Express in order to query the Twitter API and the Yahoo API. We also query the model itself in order to 
upload the relevant results unto Amazon S3. 

In future works we would enable the gathering of more stock tweet data involving other countries top stocks as well as using AWS in order to run serverless functions in order to gather API data and to predict sentiments with the machine learning model. 

The model itself is a Large Roberta Model gathered from [Hugging Face](https://huggingface.co/siebert/sentiment-roberta-large-english) specifically using a checkpoint so that binary classification can be enabled.

![Screenshot of homepage!](https://github.com/Sean-Leishman/Stock-Sentiment-Analysis/blob/model/docs/assets/home.png?raw=true)
![Screenshot of Apple stock page!](https://github.com/Sean-Leishman/Stock-Sentiment-Analysis/blob/model/docs/assets/apple.png?raw=true) 
