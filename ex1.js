'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');
var contentType = require('content-type-mime'); //识别文件类型
var formidable = require('formidable');
var querystring = require('querystring');
var session = require('./lib/session');
var sessions = [];
http.createServer(function (req, res) {
	
	var pathname = __dirname + req.url; //用户访问全路径
	var filename = decodeURIComponent(pathname); //decode url
	var readError = function (res, error, info) { //错误处理
		res.writeHead(500, {
			'Content-Type' : 'text/plain;charset=UTF-8'
		});
		console.error(error);
		res.write(info + error.toString());
		res.end();
	};

	fs.exists(filename, function (exists) {

		var relpath = req.url;
		if (relpath.substring(0, 7) !== '/public') {
			relpath = '/public';
			filename = filename.substring(0, filename.lastIndexOf('/') + 1) + 'public/';

		}
		console.log(filename);
		if (!exists) {
			res.writeHead(302, {
				'Location' : '/public'
			});
			res.end();
		} else {
			fs.stat(filename, function (err, stats) {
				if (err) {
					readError(res, err);
					return;
				}

				if (stats.isFile()) {

					var type = contentType(filename);

					
						showFile(res, filename); //显示非js文件
					

				} else if (stats.isDirectory()) {

					res.writeHead(200, {
						'Content-Type' : 'text/html;charset=UTF-8'
					});

					getDir(filename, relpath, function (err, content) {
						if (err) {
							readError(res, err);
							return;
						}
						if (!content) {
							content = "<p>该文件夹为空.</p>";
						}
						res.write(content);
						res.end();
					});

				}
			});

		}
	});

}).listen(3000);
console.log(' server is running at 3000 port.');

var getDir = function (abspath, relpath, callback) { //获取当前用户所访问路径下的所有文件以及目录

	fs.readdir(abspath, function (err, dirname) {
		if (err) {
			callback(err);
			return;
		}
		var dirnames = '';
		var indexs = function getIndexs() {
			dirname.forEach(function (item) {
				var downurl = path.join(relpath + '/' + item);
				dirnames = dirnames + '<p><a href="' + downurl + '">' + item + '</a></p>';
			});
			return dirnames;
		};
		callback(null, indexs());
	});

};



	
var jsexe = function (req, res) {
	var module_name = '.' + req.url;
	
	//session(req, res, sessions);
	
	var run = function (req, res, module_name) { //执行js文件
		try {
			var js = require(module_name);
			js(req, res);
		} catch (error) {
			var info = '' + module_name + '  无法执行或者函数非法!  ';
			errInfo(res, error, info);
			return;
		}
		finally {
			delete require.cache[require.resolve(module_name)]; //删除require模块缓存
		}
	};
		
		run(req, res, module_name);

	

};
var errInfo = function (res, err, info) {
	
	res.writeHead(500, {
		'content-type' : 'text/plain;charset=UTF-8'
	});
	res.write(info + '\n\n');
	res.end(err.toString());

};

var showFile = function (res, filename) {
	var type = contentType(filename);
	res.writeHead(200, {
		'Content-Type' : '' + type + ';charset=UTF-8'
	});
	var stream = fs.createReadStream(filename);
	stream.pipe(res); //直接显示非js文件
};

