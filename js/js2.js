'use strict';
module.exports = function (req, res) {//模拟跳转
	var a = function () {
		console.log(' I am a function');
	};
	a();
	var last = req.url.lastIndexOf('/');
	var index = req.url.substring(0, last);
	res.writeHead(302, {
		'Location' : index
	});
	console.log('302跳转成功。');
	res.end();
};
