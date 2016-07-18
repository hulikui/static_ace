var user = "user";
var pass = "123123";
var querystring = require("querystring");
module.exports = function (req, res) {
	var postData = '';
	req.addListener('data', function (chunk) {
		postData += chunk;
	});
	req.addListener('end', function () {
		var userInfo = querystring.parse(postData);
		console.log('收到信息：', userInfo);
		console.log('正确的账号为：'+ user +' 密码为：'+ pass +'');
		if (userInfo.user != 'user' || userInfo.pass != '123123') {
			res.writeHead(200, {
				'Content-Type' : 'text/html;charset=UTF-8'
			});
			res.write('密码或者账号错误');
			res.end('<p><a href = "./index.html">返回</a></p>');
		}else{
			res.writeHead(200, {
				'Content-Type' : 'text/html;charset=UTF-8'
			});
			res.write('登陆成功');
			res.end('<p><a href = "./">文件浏览</a></p>');
		}	
	});

};
