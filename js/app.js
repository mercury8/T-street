$(document).ready(function() {
	
	// pageSlider
	$().pageSlider({
		slideShow: false,
		navigator: true,
		$parentContainer: '.container-fluid',
		$slidesContainer: '#fullpage'
	});
	
	var opened = false;
	$(document).on('click', '#sNav', function(e) {
		e.preventDefault();
		if (opened) {
			closeNav();
			opened = false;
		} else {
			openNav();
			opened = true;
		}
	});
	
	$('#close-sNav').on('click', function(e) {
		e.preventDefault();
		opened = false;
	});
	
});

function openNav() {
	document.getElementById("sidenav").style.left = "0";
}

function closeNav() {
	document.getElementById("sidenav").style.left = "-16vw";
}