// $Id: activesearch.js,v 1.2.2.8 2008/03/29 13:37:28 nedjo Exp $

Drupal.settings = Drupal.settings ? Drupal.settings : {};
Drupal.settings.activesearchCurrentHash = (location.hash.substring(0, 5) == '#keys') ? location.hash.replace('#', '') : '';
Drupal.settings.activesearchIntervalId = null;

Drupal.behaviors.activeSearch = function (context) {
  $('#search-theme-form, #search-block-form').append('<input type="hidden" name="activesearch" value="1" />');
  $('#search-form')
    .append('<input type="hidden" name="activesearch" value="1" />')
    .each(function () {
      var elt = new Drupal.activesearch(this);
    })
    .find('input.form-submit')
    // Clear any previously-registered paging data.
    .click(function () {
      $('#edit-page').attr('value', '');
    });
  // Submit if there is a hash set.
  if (location.hash  && (location.hash != '#') && (location.hash.substring(0, 5) == '#keys') && $('#search-form').length) {
    Drupal.activesearchSubmit();
  }
  // IE seems to work without the interval test.
  if (!$.browser.msie) {
    Drupal.settings.activesearchIntervalId = setInterval(Drupal.activesearchMonitor, 200);
  }
};

Drupal.activesearchSubmit = function() {
  $('#edit-keys').attr('value', location.hash.substring(6).replace('#', ''));
  // Call the submit event.
  $('#search-form').submit();
  // Actually submit the form.
  $('#search-form')[0].submit();
};

Drupal.activesearchMonitor = function() {
  if ($('#search-form').size()) {
    if ((location.hash.substring(0, 5) == '#keys') && (location.hash != '#' + Drupal.settings.activesearchCurrentHash)) {
      Drupal.settings.activesearchCurrentHash = location.hash.replace('#', '');
      Drupal.activesearchSubmit();
    }
  }
  else {
    clearInterval(Drupal.settings.activesearchIntervalId);
  }
};

/**
 * activesearch object.
 */
Drupal.activesearch = function(form) {
  Drupal.redirectFormSubmit($(form).attr('action'), form, this);
};

/**
 * Handler for the form redirection submission.
 */
Drupal.activesearch.prototype.onsubmit = function () {
  // Insert progressbar.
  this.progress = new Drupal.progressBar('ajaxeditprogress');
  this.progress.setProgress(-1, 'Fetching results');
  var el = this.progress.element;
  $(el).css({
    width: '250px',
    height: '15px',
    paddingTop: '10px'
  });
  $('dl.search-results')
    .html('')
    .append(el)
    .fadeIn('slow');
};

/**
 * Handler for the form redirection completion.
 */
Drupal.activesearch.prototype.oncomplete = function (data) {
  //$(this.progress.element).remove();
  //this.progress = null;
  var hash = data.keys;
  location.hash = Drupal.settings.activesearchCurrentHash = 'keys=' + hash;
  $('dl.search-results')
    .hide()
    .html(data.results)
    .find('.drupal-tabs')
    .addClass('tabs')
    .tabs({
      onShow: Drupal.tabsAddClassesCallback()
    })
    .show()
    .find('ul.anchors')
    .addClass('tabs')
    .addClass('primary')
    .end()
    .end()
    .fadeIn('fast')
    .find('div.pager a')
    .click(function () {
      var args = Drupal.parseQueryString($(this).attr('href'));
      $('#edit-page').attr('value', args['page'] ? args['page'] : '');
      location.hash = Drupal.settings.activesearchCurrentHash = 'keys=' + args['keys'];
      Drupal.activesearchSubmit();
      return false;
    });
};

/**
 * Handler for the form redirection error.
 */
Drupal.activesearch.prototype.onerror = function (error) {
  alert('An error occurred.');
  $(this.progress.element).fadeOut('slow', function() {
      $(this).remove();
    });
  this.progress = null;
};
