<script>
    export let tweet;
    export let sentiment;
    export let probability;
</script>

    <div class='bg-gray-100 border border-slate-300 rounded-2xl duration-300 my-8 p-5 max-w-screen'>
        <div class='flex justify-between'>
          <a class='flex items-center gap-3 group' href='https://twitter.com/naval/status/1516188493541785606'>
            <img
              class='rounded-full h-12 w-12'
              src={tweet.author.profileImageUrl}
            />
            <div class='flex flex-col leading-snug'>
              <span class='text-sm font-semibold flex gap-2'>
                {tweet.author.name}
                <span class='text-sm font-normal opacity-70 group-hover:opacity-100 duration-300'>{tweet.author.username}</span>
              </span>
              <span class='text-sm opacity-80 group-hover:opacity-100 duration-300'>{tweet.createdAt}</span>
            </div>
          </a>
        </div>
        <div class='text-lg my-3 leading-normal'>
          {tweet.text}
        </div>
        <div class='flex mt-2 gap-6 text-sm font-medium tracking-wider'>
          <span>{tweet.metrics.replies} Replies</span>
          <span>{tweet.metrics.retweets} Retweets</span>
          <span>{tweet.metrics.likes} Likes</span>
          <span>{tweet.metrics.impressions} Impressions</span>
        </div>
        <div class='flex mt-2 gap-6 text-sm font-medium tracking-wider'>
            <span>{sentiment}</span>
            <span>{probability}</span>
          </div>
      </div>