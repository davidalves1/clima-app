#! /usr/bin/env node

'use strict';

const https = require('https');
const ForecastIO = require('forecast-io');
// Faça o cadastro em https://developer.forecast.io/ para obtera a chave da api e substitua abaixo.
const forecast = new ForecastIO('forecast-api-key');
const querystring = require('querystring');
const meow = require('meow');

const cli = meow(`
    Modo de uso:
      $ tempo <cidade>

    Exemplo:
      $ tempo São Paulo
`, {});

let busca = cli.input.join(' ');
if (busca.length === 0) {
	console.log('Ops, você digitou uma cidade inválida!');
	return;
}

let cidade = querystring.stringify({ address: busca })

https
	.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${cidade}&components=country:BR`, 
		(response) => {
		let body = '';
		response.on('data', (data) => {
			body += data;
		});
		response.on('error', (e) => {
			console.log('Ops, cidade não encontrada! :(');
		});
		response.on('end', () => {
			 let location = JSON.parse(body).results[0].geometry.location;
      		
      		forecast
				.latitude(location.lat)
				.longitude(location.lng)
				.get()
				.then((res) => {
					res = JSON.parse(res).currently;            
			    	let temperatura = (res.temperature - 32) / 1.8;
			    	let icone = res.icon.replace(/\W/g, '');
			    	console.log(`${busca.toUpperCase()}: ${eval('mensagem.' + icone)}` +
			    	 	` A temperatura no momento é aproximadamente ${Math.round(temperatura)}°c.`);
			    })
			    .catch((err) => {
			        console.log('Ops, algo de errado aconteceu. :( \n\n' + 
			        	`Error:  ${err.split('\n')[1]}` +
			        	'\n\nPor favor, informe o erro acima em: https://github.com/davidalves1/clima-app/issues' + 
			        	'\nObrigado! :)');
				});
		});
	});
	

const mensagem = {
	clearday: 'Dia com céu claro.', 
	clearnight: 'Noite com céu estrelado.',	 
	rain: 'Prepare o guarda chuva, pois parece que vai chover.', 
	snow: 'Tire as cobertas do guarda-roupas, pois parece que o frio vem com tudo.', 
	sleet: 'Prepare seu chá, pois parece que vem chuva e frio.', 
	wind: 'Macacos me mordam! Que vento é esse hein?!', 
	fog: 'Hoje a neblina parece ter vindo com tudo.', 
	cloudy: 'Tempo encoberto.', 
	partlycloudyday: 'Dia parcialmente nublado.',
	partlycloudynight: 'Noite parcialmente nublada.'
};
