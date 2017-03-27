$(document).ready(function () {
	$("#delCookie").click(function(){
		del_cookie("cookie");
	});
	//console.log(document.cookie);
	var visit = getCookie("cookie");
	if (visit == null) {
		$('.welcome').animate({
			bottom: "50%"
		}, 100);
		var expire = new Date();
		expire = new Date(expire.getTime() + 7776000000);
		document.cookie = "cookie=here; expires=" + expire;
	}
});

function del_cookie(name) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	} else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start, c_end));
	}
	return c_value;
}

//handle welcome popup content
var main = function() {
	/* Push the body and the nav over by 285px over */
	$('.welcome-open').click(function() {
		// console.log('clicked');
		$('.welcome').animate({
			bottom: "50%"
		}, 800);
		$('.welcome-open').animate({opacity: 0}, "fast");
	});
	/* Then push them back */
	$('.welcome-close').click(function() {
		// console.log('clicked');
		$('.welcome').animate({
			bottom: "-100%"
		}, 600);
		$('.welcome-open').animate({opacity: 1}, "fast");
	});
};

$(document).ready(main);
