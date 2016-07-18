
var uuid = require('node-uuid');
var path = require('path');

module.exports = function (req, res, sessions) {//פ���ڴ�sessionʵ��

	function getSid(req) { //��ȡsession id ����
		var _cookies = {};
		req.headers.cookie && req.headers.cookie.split(';').forEach(function (Cookie) {
			var parts = Cookie.split('=');
			_cookies[parts[0].trim()] = (parts[1] || '').trim();
		});
		return _cookies.sid;
	}

	function isInSession(req) { //��ѯ�Ƿ����ĳ�û�session

		if (!req) {
			return false;
		}
		if (sessions.length <= 0) {
			return false;
		}
		var id = getSid(req); //�����id�ֶ�Ψһ��ʶ
		for (var i = 0; i < sessions.length; i++) {
			if (sessions[i].sid == id) {
				return true;
			}
		}
		return false;
	}

	function addSession(jsonObj) { //����session��������
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
	
	function signOut() { //ע��session��cookie
		var id = getSid(req);
		res.setHeader('Set-Cookie', "sid=" + id + "; path=/; max-age=0");
		deleteSession(id);

	}
	
	function signIn(user) { //ע�� session

		var sessionId = uuid.v1(); //����ʱ������Ψһ�ַ���

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
	
	if (isInSession(req)) { //�鿴��ǰsession_id�Ƿ����
		var sid = getSid(req);
		res.setHeader('Set-Cookie', "sid=" + sid + "; path=/; max-age=1200"); //ˢ��cookie
		req.session = {
			Login : signIn, //ע��session
			Info : getSession(), //��ȡĳ�û�session
			Logout : signOut, //ע��session
			isLogin : isInSession(req), //��ѯ�Ƿ����ĳ�û�session
			put : put //�û��Զ���session info����

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
