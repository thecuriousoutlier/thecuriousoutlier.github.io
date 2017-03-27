$('.container').removeClass("is-closed").addClass("is-open");
var isClosed = true;
var menu = document.getElementsByClassName('filterDistrictNames');

$(function() {
	$(window).resize(function(){
		if (isClosed == false) {
			if ($(window).width() > 1200) {
				menu.css({left: 0});
			} else if ($(window).width() < 1200 && $(window).width() > 800) {
				menu.css({left: -430});
			} else if ($(window).width() < 800 && $(window).width() > 500) {
				menu.css({left: -320});
			} else if ($(window).width() < 500) {
				menu.css({left: -260});
			}
		} else {
			if ($(window).width() < 1200 && $(window).width() > 800) {
				$(".menu-icon").css({left: 425});
			} else if ($(window).width() < 800 && $(window).width() > 500) {
				$(".menu-icon").css({left: 320});
			} else if ($(window).width() < 500) {
				$(".menu-icon").css({left: 260});
			}
		}
	});
});

//Happends when clicked
$(function() {
	$(".menu-icon").on("click", function() {
		var that = $('.container');
		if (that.hasClass("is-open")) {
			if ($(window).width() < 1200 && $(window).width() > 800) {
				$('.filterDistrictNames').animate({
					left: "-430px"
				}, 200);
				$('.menu-icon').animate({
					left: "0px"
				}, 200);
			} else if ($(window).width() < 800 && $(window).width() > 500) {
				$('.filterDistrictNames').animate({
					left: "-320px"
				}, 200);
				$('.menu-icon').animate({
					left: "0px"
				}, 200);
			} else if ($(window).width() < 500) {
				$('.filterDistrictNames').animate({
					left: "-260px"
				}, 200);
				$('.menu-icon').animate({
					left: "0px"
				}, 200);
			}
			isClosed = false;
			that.removeClass("is-open").addClass("is-closed");
		} else {
			if ($(window).width() < 1200 && $(window).width() > 800) {
				$('.filterDistrictNames').animate({
					left: "0px"
				}, 200);
				$('.menu-icon').animate({
					left: "425"
				}, 200);
			} else if ($(window).width() < 800 && $(window).width() > 500) {
				$('.filterDistrictNames').animate({
					left: "0"
				}, 200);
				$('.menu-icon').animate({
					left: "320px"
				}, 200);
			} else if ($(window).width() < 500) {
				$('.filterDistrictNames').animate({
					left: "0"
				}, 200);
				$('.menu-icon').animate({
					left: "260px"
				}, 200);
			}
			isClosed = true;
			that.removeClass("is-closed").addClass("is-open");
		}
	});
});
