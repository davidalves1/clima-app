#! /usr/bin/env node

const https = require('https');
const ForecastIO = require('forecast-io');
const forecast = new ForecastIO('your-forecast-api-key');
const querystring = require('querystring');
const meow = require('meow');

const cli = meow(`
    Modo de uso:
      $ tempo <cidade>

    Exemplo:
      $ tempo baixo guandu
      BAIXO GUANDU: Noite com céu estrelado. A temperatura no momento é aproximadamente 19°c com sensação térmica de 19°c
`, {});

let busca = cli.input.join(' ');

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
		response.on('end', function(){
			 let location = JSON.parse(body).results[0].geometry.location;
      		
      		forecast
				.latitude(location.lat)
				.longitude(location.lng)
				.get()
				.then((res) => {
					res = JSON.parse(res).currently;            
			    	let temperatura = (res.temperature - 32) / 1.8;
			    	let sensacao = (res.apparentTemperature - 32) / 1.8;
			    	let icone = res.icon.replace(/\W/g, '');
			    	console.log(`${busca.toUpperCase()}: ${eval('mensagem.' + icone)}` +
			    	 	` A temperatura no momento é aproximadamente ${Math.round(temperatura)}°c` +
			    	 	` com sensação térmica de ${Math.round(sensacao)}°c`);
			    })
			    .catch((err) => {
			        console.log('Ops, algo de errado aconteceu. :( \n\n' + 
			        	`Error:  ${err.split('\n')[1]}` +
			        	'\n\nPor favor, informe o erro acima em: https://github.com/davidalves1/clima-app/issues');
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
	cloudy: 'Tempo encoberto. :|', 
	partlycloudyday: 'Dia parcialmente nublado',
	partlycloudynight: 'Noite parcialmente nublada'
};
