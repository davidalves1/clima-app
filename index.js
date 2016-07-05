'use strict';

const https = require('https');
const ForecastIO = require('forecast-io');
const forecast = new ForecastIO('0150e5d9684da63622a19f07003b6126');

process.argv.splice(2).forEach(function(cidade, index) {
	https.get(
	{
		hostname: 'maps.googleapis.com',  
		path: `/maps/api/geocode/json?address=${encodeURI(cidade)}&components=country:BR&key=AIzaSyBlNHmcp-F0Tb7Di36M-pVf5RKyx4R3Jp0`,  
		agent: false
	}, (response) => {
		var body = '';
		response.on('data', function(data) {
			body += data;
		});
		response.on('error', function(e) {
			console.log('Error:' + e.message);
		});
		response.on('end', function(){
			var geo = JSON.parse(body);
      		geo = JSON.stringify(geo.results[0].geometry.location, null, 2);
		});
	});
});

forecast
	.latitude(geo.lat)
	.longitude(geo.lng)
	.get()
	.then(res => {
		res = JSON.parse(res);            
    	console.log(JSON.stringify(res.currently, null, 2));
    })
    .catch(err => {
        console.log(err)
});