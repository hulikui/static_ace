
var uuid = require('node-uuid');
var path = require('path');

module.exports = function (req, res, sessions) {//驻留内存session实现

	function getSid(req) { //获取session id 函数
		var _cookies = {};
		req.headers.cookie && req.headers.cookie.split(';').forEach(function (Cookie) {
			var parts = Cookie.split('=');
			_cookies[parts[0].trim()] = (parts[1] || '').trim();
		});
		return _cookies.sid;
	}

	function isInSession(req) { //查询是否存在某用户session

		if (!req) {
			return false;
		}
		if (sessions.length <= 0) {
			return false;
		}
		var id = getSid(req); //定义的id字段唯一标识
		for (var i = 0; i < sessions.length; i++) {
			if (sessions[i].sid == id) {
				return true;
			}
		}
		return false;
	}

	function addSession(jsonObj) { //插入session对象数组
		if (!jsonObj) {
			return null;
		}
		if (isInSession(req)) {
			return jsonObj;
		}
		sessions.push(jsonObj);
		return jsonObj;
	}
	
	function deleteSession(id) {

		for (var i = 0; i < sessions.length; i++) {
			if (sessions[i].sid === id) {
				sessions = sessions.splice(i, 1);
				return true;
			}

		}
		return false;

	}
	
	function signOut() { //注销session和cookie
		var id = getSid(req);
		res.setHeader('Set-Cookie', "sid=" + id + "; path=/; max-age=0");
		deleteSession(id);

	}
	
	function signIn(user) { //注册 session

		var sessionId = uuid.v1(); //根据时间生成唯一字符串

		var jsonObj = {
			LoginUser : user,
			sid : sessionId,
			start_date : new Date()

		};
		addSession(jsonObj);
		res.setHeader('Set-Cookie', "sid=" + sessionId + "; path=/; max-age=1200");
	}

	function getSession() {
		var id = getSid(req);
		if (sessions.length <= 0) {
			return null;
		}
		for (var i = 0; i < sessions.length; i++) {
			if (sessions[i].sid == id) {
				return sessions[i];
			}
		}
		return null;
	}
	
	function put(name, value,callback){
		var id =getSid(req);
		if(!id&&!name){
			callback(new Error('No the session or name/value is undefined'));
		}
		for (var i = 0; i < sessions.length; i++) {
			if (sessions[i].sid == id) {
				sessions[i][name] = value;
				req.session.Info = sessions[i];
				callback(null, sessions[i]);
			}
		}
		
	}
	
	if (isInSession(req)) { //查看当前session_id是否存在
		var sid = getSid(req);
		res.setHeader('Set-Cookie', "sid=" + sid + "; path=/; max-age=1200"); //刷新cookie
		req.session = {
			Login : signIn, //注册session
			Info : getSession(), //获取某用户session
			Logout : signOut, //注销session
			isLogin : isInSession(req), //查询是否存在某用户session
			put : put //用户自定义session info属性

		};
	} else {
		req.session = {
			Login : signIn,
			Info : getSession,
			Logout : signOut,
			isLogin : false,

		};
	}
	

};
