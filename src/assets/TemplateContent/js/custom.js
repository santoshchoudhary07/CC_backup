$(document).on('click', '.task-tab', function () {
	if ($(this).next().is(':visible')) {
	  $(this).next().slideUp();
	}
	if ($(this).next().is(':hidden')) {
	  $('.task-tab').next().slideUp();
	  $(this).next().slideDown();
	}
  });