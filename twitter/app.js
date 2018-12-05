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

const boundingBoxCoordinatesAroundSweden = '10.5922629,55.1365705,24.1773101,69.0600235';
const stream = client.stream('statuses/filter', {track: '', locations: boundingBoxCoordinatesAroundSweden});

const tweetIsFromASwedishCity = (place) => {
  return (place !== null && place.country_code === 'SE' && place.place_type === 'city' && cities[place.name] !== undefined);
};

stream.on('data', (data) => {
  if (tweetIsFromASwedishCity(data.place)) {
    const city = data.place.name;
    const {county, municipality} = cities[city];
    const datetime = new Date(data.created_at).toISOString().substr(0, 10);
    const url = 'https://twitter.com/statuses/' + data.id_str;

    const tweet = {
      datetime: datetime,
      country: 'Sweden',
      county: county,
      municipality: municipality,
      city: data.place.name,
      text: data.text,
      url: url
    }

    axios.post(`http://${process.env.NEWS_SERVICE_HOST}:${process.env.NEWS_SERVICE_PORT}/api/fill_timespan`, {
      service: 'twitter',
      news: [tweet],
      timespan: {
        from: '',
        until: ''
      }
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