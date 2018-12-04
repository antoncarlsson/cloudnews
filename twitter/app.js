require('dotenv').config();
const Twitter = require('Twitter');
const cities = require('./cities.json');
const axios = require('axios');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const stream = client.stream('statuses/filter', {track: '', locations: '10.5922629,55.1365705,24.1773101,69.0600235'});

stream.on('data', (data) => {
  if(data.place !== null && data.place.country_code === 'SE' && data.place.place_type === 'city') {
    const city = data.place.name;
    const {county, municipality} = cities[city];
    const tweet = {
      timestamp: data.created_at,
      country: 'Sweden',
      county: county,
      municipality: municipality,
      city: data.place.name,
      text: data.text,
      url: 'https://twitter.com/statuses/' + data.id_str,
    }

    axios.post(`http://${process.env.NEWS_SERVICE_HOST}:${process.env.NEWS_SERVICE_PORT}/api/articles`, {
			articles: [tweet]
		})
		.then((res) => {
			console.log(res);
		})
		.catch((error) => {
			console.log(error);
		});
  }
});

stream.on('error', (error) => {
  console.log('error', error);
});