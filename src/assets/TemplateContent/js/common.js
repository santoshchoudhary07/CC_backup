$(document).on('click', '.accordion-button', function () {
  if ($(this).next().is(':visible')) {
    $(this).next().slideUp();
    $(this).removeClass('swapbox-to-open')
    $(this).parent().next().removeClass('remove-border-onclick')
  }
  if ($(this).next().is(':hidden')) {
    $('.accordion-button').next().slideUp();
    $('.accordion-button').removeClass('swapbox-to-open')
    $('.accordion-button').parent().next().removeClass('remove-border-onclick')
    $(this).next().slideDown();
    $(this).addClass('swapbox-to-open')
    $(this).parent().next().addClass('remove-border-onclick')
  }
});

$(document).on('click', '.task-tab', function () {
  if ($(this).next().is(':visible')) {
    $(this).next().slideUp();
  }
  if ($(this).next().is(':hidden')) {
    $('.task-tab').next().slideUp();
    $(this).next().slideDown();
  }
});
function pastNumber(evt) {
  var pastedData = evt.clipboardData.getData('text');
  var reg = /^[1-9]\d*(\.\d+)?$/
  var res = reg.test(pastedData);
  return res;
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function isNumber(evt) {
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode == 46) {
    //Check if the text already contains the . character
    if (evt.target.value.indexOf('.') === -1) {
      return true;
    } else {
      return false;
    }
  } else {
    if (charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;
  }
  if (evt.target.value.indexOf('.') === 1) {
    var d = evt.target.value.split('.');
    if (d.length > 2)
      return false;
  }
  return true;
}


$(document).ready(function () {
  $('body').on('keypress', 'input', function (e) {
    if (e.which === 32 && !this.value.length) {
      e.preventDefault();
    }
    if (this.value.length > 50 && e.which != 8) {
      e.preventDefault();
    }
    if (this.value.trim().length != 0) {
      if (this.value.trim().length == 0) {
        e.preventDefault();
      }
    }
  });
  $('body').on('mouseout', 'input[type=text]', function (e) {
    if (this.value.trim().length == 0) {
      this.value = '';
      // True - phone only contains whitespace
    }
    else {
      // False - phone contains character(s)
    }
  });

  $('input').bind('paste', function (e) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46) {
      //Check if the text already contains the . character
      if (evt.target.value.indexOf('.') === -1) {
        return true;
      } else {
        e.preventDefault();
      }
    } else {
      if (charCode > 31
        && (charCode < 48 || charCode > 57))

        e.preventDefault();
    }
    if (evt.target.value.indexOf('.') === 1) {
      var d = evt.target.value.split('.');
      if (d.length > 2)
        e.preventDefault();
    }
    return true;
  });


  $('input[type=number]').on('focusout', function (e) {
    var $this = $(this);
    $this.val($this.val().replace(/[^0-9]/g, ''));
  }).on('paste', function (e) {
    var $this = $(this);
    setTimeout(function () {
      $this.val($this.val().replace(/[^0-9]/g, ''));
    }, 5);
  });

})


$(document).on('click', '.slider-charts .slider-prev', function (event) {
  event.preventDefault();

  $sliderChartsSlides.trigger('prev.owl.carousel');
});

$(document).on('click', '.slider-charts .slider-next', function (event) {
  event.preventDefault();

  $sliderChartsSlides.trigger('next.owl.carousel');
});

// example loading
$(document).on('click', '.toggle-loading', function (event) {
  event.preventDefault();

  $('.loading-overlay').addClass('visible');
});

// accordion
$(document).on('click', '.accordion-head', function () {
  //debugger;
  $(this)
    .closest('.accordion-section')
    .toggleClass('accordion-section-expanded')
    .siblings()
    .removeClass('accordion-section-expanded');
});

$(document).on('click', '.open-next-accordion-section', function (event) {
  event.preventDefault();

  $(this)
    .closest('.accordion-section')
    .next()
    .toggleClass('accordion-section-expanded')
    .siblings()
    .removeClass('accordion-section-expanded');
});

$(document).on('click', '.open-prev-accordion-section', function (event) {
  event.preventDefault();

  $(this)
    .closest('.accordion-section')
    .prev()
    .toggleClass('accordion-section-expanded')
    .siblings()
    .removeClass('accordion-section-expanded');
});

$(document).on('click', '.item-toggle', function (event) {
  event.preventDefault();

  $(this).toggleClass('item-hidden');
});

$(document).on('click', '.link-toggle-all', function (event) {
  event.preventDefault();

  $('.accordion-section').addClass('accordion-section-expanded');
});

// $(document).on('click', '.security-inner-table', function(event){
// 	event.preventDefault();
// 	$('.security-inner-table tbody').toggleClass('changeDisplayStatus');
// });

function ExportToPDF() {

  // var pdf = new jsPDF('p', 'pt', 'ledger');
  // pdf.setFontSize(15);
  // var source = $('#tblreport')[0];
  // var specialElementHandlers = {
  //   '#bypassme': function (element, renderer) {
  //     return true
  //   }
  // };
  // var margins = {
  //   top: 80,
  //   bottom: 0,
  //   left: 60,
  //   right:15
  // };
  // pdf.fromHTML(source, // HTML string or DOM elem ref.
  //   margins.left, // x coord
  //   margins.right, 
  //   { // y coord
  //     //'width': 1000, // max width of content on PDF
  //     'elementHandlers': specialElementHandlers
  //   },

  //   function (dispose) {
  //     pdf.save('Report.pdf');
  //   }, margins);


  var doc = new jsPDF('p', 'pt', 'ledger');

  var res = doc.autoTableHtmlToJson(document.getElementById("basic-table"));
   doc.autoTable(res.columns, res.data, { margin: { top: 80 } });

  var header = function (data) {
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.setFontStyle('normal');
    //doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
    doc.text("Testing Report", data.settings.margin.left, 50);
  };

  // var options = {
  //   //beforePageContent: header,
  //   margin: {
  //     top: 80
  //   },
  //   startY: doc.autoTableEndPosY() + 20,
  //   styles: {
  //     overflow: 'linebreak',
  //     // fontSize: 10,
  //     // rowHeight: 11,
  //     columnWidth: 'wrap'
  //   }
  // };
 // doc.autoTable(res.columns, res.data, options);

  doc.save("reports.pdf");
}