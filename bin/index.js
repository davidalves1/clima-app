#! /usr/bin/env node

'use strict';

const https = require('https');
// Faça o cadastro em https://developer.forecast.io/ para obtera a chave da api e substitua abaixo.
const api_key = 'forecast-api-key';
const querystring = require('querystring');
const meow = require('meow');
const estados = require('./estados');

const cli = meow(`
    Modo de uso:
      $ tempo <cidade>

    Exemplo:
      $ tempo São Paulo

`, {});

const busca = cli.input.join(' ');

if (busca.length === 0) {
	console.log('Ops, você digitou uma cidade inválida!');
	return;
}

const cidade = querystring.stringify({ address: busca });

https
	.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${cidade}&components=country:BR`, (response) => {
		let body = '';

		response.on('data', (data) => {
			body += data;
		});

		response.on('error', (e) => {
			console.log('\nOps, cidade não encontrada! :(\n');
		});

		response.on('end', () => {

			const results = JSON.parse(body).results[0];

      if (!results.types.includes('locality') && !results.types.includes('political')) {
				console.log('\nOps, você digitou uma cidade inválida!\n');
				return;
			}

			const nome_cidade = results.formatted_address.split(', ')[0];

            if (nome_cidade == 'Brazil') {
                console.log('\nOps, você digitou uma cidade inválida!\n');
                return;
            }

			// let estado = results.address_components.reverse()[1].short_name;
			const estado = results.address_components.filter(item => {
        return estados.includes(item.short_name);
      });

      if (!Array.isArray(estado)) {
        console.log('\nOps, você digitou uma cidade inválida!\n');
        return;
      }

      const uf = estado[0].short_name;

			const location = results.geometry.location;

			forecast(location.lat, location.lng, nome_cidade, uf)
				.then(handleSuccess)
				.catch(handleError);
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

function forecast(lat, lng, city, uf) {
	return new Promise((resolve, reject) => {
		https
			.get(`https://api.darksky.net/forecast/${api_key}/${lat},${lng}`, (response) => {
				let body = '';
				response.on('data', (data) => {
					body += data;
				});
				response.on('error', (err) => {
					reject('\nOps, algo de errado aconteceu. :( \n\n' +
				        	`Error:  ${err.split('\n')[1]}` +
				        	'\n\nPor favor, informe o erro acima em: https://github.com/davidalves1/clima-app/issues' +
				        	'\nObrigado! :)\n');
				});
				response.on('end', () => {
					let res = JSON.parse(body).currently;

					resolve({
						cidade: city,
						estado: uf,
						temperatura: (res.temperature - 32) / 1.8,
						icone: res.icon.replace(/\W/g, '')
					});
				});
		});
	});
}

function handleSuccess(data) {
	console.log(`\n${data.cidade.toUpperCase()} - ${data.estado}: ${eval('mensagem.' + data.icone)}` +
		    	 		` A temperatura no momento está em torno de ${Math.round(data.temperatura)}°c.\n`);
}

function handleError(err) {
	console.log(err);
}
