#! /usr/bin/env node

const https = require('https');
const ForecastIO = require('forecast-io');
const forecast = new ForecastIO('0150e5d9684da63622a19f07003b6126');
var querystring = require('querystring')

var busca = process.argv.splice(2, process.argv.length -1).join(' ');

var cidade = querystring.stringify({ address: busca })

https
	.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${cidade}&components=country:BR`, 
		(response) => {
		var body = '';
		response.on('data', function(data) {
			body += data;
		});
		response.on('error', function(e) {
			console.log('Ops, cidade não encontrada! :(');
		});
		response.on('end', function(){
			 var location = JSON.parse(body).results[0].geometry.location;
      		
      		forecast
				.latitude(location.lat)
				.longitude(location.lng)
				.get()
				.then(res => {
					res = JSON.parse(res).currently;            
			    	var temperatura = (res.temperature - 32) / 1.8;
			    	var icone = res.icon.replace(/\W/g, '');
			    	console.log(`${eval('mensagem.' + icone)} ${busca.toUpperCase()}.` +
			    	 	` A temperatura no momento é ${temperatura.toFixed(1)}°c`);
			    })
			    .catch(err => {
			        console.log('Error!!!', err);
				});
		});
	});
	

var mensagem = {
	clearday: 'Dia com céu claro em', 
	clearnight: 'Noite com céu claro em',	 
	rain: 'No momento chove em', 
	snow: 'No momento neva em', 
	sleet: 'No momento neva e chove em', 
	wind: 'No momento venta forte em', 
	fog: 'No momento a neblima cobre', 
	cloudy: 'Tempo encoberto em', 
	partlycloudyday: 'Dia parcialmente nublada em',
	partlycloudynight: 'Noite parcialmente nublada em'
};