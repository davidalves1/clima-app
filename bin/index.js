#! /usr/bin/env node

const https = require('https');
const ForecastIO = require('forecast-io');
const forecast = new ForecastIO('your-forecast-api-key');
var querystring = require('querystring')

var busca = process.argv.splice(2, process.argv.length -1).join(' ');

var cidade = querystring.stringify({ address: busca })

https
	.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${cidade}&components=country:BR`, 
		(response) => {
		var body = '';
		response.on('data', (data) => {
			body += data;
		});
		response.on('error', (e) => {
			console.log('Ops, cidade não encontrada! :(');
		});
		response.on('end', function(){
			 var location = JSON.parse(body).results[0].geometry.location;
      		
      		forecast
				.latitude(location.lat)
				.longitude(location.lng)
				.get()
				.then((res) => {
					res = JSON.parse(res).currently;            
			    	var temperatura = (res.temperature - 32) / 1.8;
			    	var sensacao = (res.apparentTemperature - 32) / 1.8;
			    	var icone = res.icon.replace(/\W/g, '');
			    	console.log(`${busca.toUpperCase()}: ${eval('mensagem.' + icone)}.` +
			    	 	` A temperatura no momento é aproximadamente ${temperatura.toFixed(1)}°c` +
			    	 	` com sensação térmica de ${sensacao.toFixed(0)}°c`);
			    })
			    .catch((err) => {
			        console.log('Error!!!', err);
				});
		});
	});
	

var mensagem = {
	clearday: 'Dia com céu claro', 
	clearnight: 'Noite com céu claro',	 
	rain: 'No momento chove', 
	snow: 'No momento neva', 
	sleet: 'No momento neva e chove', 
	wind: 'No momento venta forte', 
	fog: 'No momento a neblima cobre a cidade', 
	cloudy: 'Tempo encoberto', 
	partlycloudyday: 'Dia parcialmente nublado',
	partlycloudynight: 'Noite parcialmente nublada'
};
