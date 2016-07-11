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
			    	console.log(`${busca.toUpperCase()}: ${eval('mensagem.' + icone)}` +
			    	 	` A temperatura no momento é aproximadamente ${temperatura.toFixed(1)}°c` +
			    	 	` com sensação térmica de ${sensacao.toFixed(0)}°c`);
			    })
			    .catch((err) => {
			        console.log('Ops, algo de errado aconteceu. :( \n\n' + 
			        	`Error:  ${err.split('\n')[1]}` +
			        	'\n\nPor favor, informe o erro acima em: https://github.com/davidalves1/clima-app/issues');
				});
		});
	});
	

var mensagem = {
	clearday: 'Dia com céu claro.', 
	clearnight: 'Noite com céu estrelado.',	 
	rain: 'Prepare o guarda chuva, pois parece que vai chover.', 
	snow: 'Tire as cobertas do guarda-roupas, pois parece que o frio vem com tudo.', 
	sleet: 'Prepare seu chá, pois parece que vem chuva e frio.', 
	wind: 'Macacos me mordam! Que vento é esse hein?!', 
	fog: 'Hoje a neblina parece ter vindo com tudo.', 
	cloudy: 'Tempo encoberto. :|', 
	partlycloudyday: 'Dia parcialmente nublado',
	partlycloudynight: 'Noite parcialmente nublada'
};
