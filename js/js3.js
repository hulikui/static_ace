'use strict';
var http = require('http');
module.exports = function (req, res) {
	http.get({
		host : '127.0.0.1',
		path : '/test',
		port : 3000
	}, function (response) {
		var content = "";
		response.on('data', function (chunk) {
			content += chunk;
		});
		response.on('end', function () {
			var last = req.url.lastIndexOf('/');
			var index = req.url.substring(0, last);
			console.log(index);
			console.log('收到服务器发来的消息:', content);
			var redrect = function (res) {
				res.writeHead(302, {
					'Location' : '/',
				});
				console.log('302跳转成功。');
				res.end();
			};
			redrect(res);
			
			/*setTimeout(function(){//模拟延迟
			redrect(res)
			},4000);*/

		});
	});
};
