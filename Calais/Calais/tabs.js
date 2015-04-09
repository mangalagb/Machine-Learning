// $Id: tabs.js,v 1.2.2.9 2008/03/29 13:37:28 nedjo Exp $

Drupal.behaviors.tabs = function (context) {

  // Process custom tabs.
  $('.drupal-tabs:not(.tabs-processed)', context)
    .addClass('tabs-processed')
    .addClass('tabs')
    .each(function () {
      if ($(this).is('.tabs-navigation')) {
        Drupal.tabsNavigation(this);
      }
    })
    .tabs({
      fxFade: Drupal.settings.tabs.fade,
      fxSlide: Drupal.settings.tabs.slide,
      fxSpeed: Drupal.settings.tabs.speed,
      fxAutoHeight: Drupal.settings.tabs.auto_height,
      onShow: Drupal.tabsAddClassesCallback()
    })
    .show()
    .find('> ul.anchors')
    .after('<span class="clear"></span>')
    .addClass('tabs')
    .each(function () {
      // Assign secondary class to nested tabsets.
      var newClass = $(this).parents('.drupal-tabs').size() > 1 ? 'secondary' : 'primary';
      $(this).addClass(newClass);
    });
  Drupal.tabsAddClasses();
};

Drupal.tabsAddClassesCallback = function() {
  return function() {
    Drupal.tabsAddClasses();
  }
};

Drupal.tabsAddClasses = function() {
  $('ul.anchors.tabs.primary')
    .find('.active')
    .removeClass('active')
    .end()
    .find('.tabs-selected')
    .addClass('active');
};

Drupal.tabsNavigation = function(elt) {
  // Extract tabset name
  var tabsetName = $(elt).get(0).id.substring(5);
  var count = $(elt).find('> ul.anchors > li').size();
  for (i = 1; i <= count; i++) {
    var tabContent = $('#tabs-' + tabsetName + '-' + i);
    if ((i > 1) || (i < count)) {
      tabContent.append('<span class="clear"></span><div class="tabs-nav-link-sep"></div>');
    }
    if (i > 1) {
      var link = $(document.createElement('a'))
        .append(Drupal.settings.tabs.previous_text)
        .attr('id', 'tabs-' + tabsetName + '-previous-link-' + i)
        .addClass('tabs-nav-previous')
        .click(function() {
          var tabIndex = parseInt($(this).attr('id').substring($(this).attr('id').lastIndexOf('-') + 1));
          $(elt).triggerTab(tabIndex - 1);
          Drupal.scrollTo(elt);
          return false;
        });
      tabContent.append(link);
    }
    if (i < count) {
      var link = $(document.createElement('a'))
        .append(Drupal.settings.tabs.next_text)
        .attr('id', 'tabs-' + tabsetName + '-next-button-' + i)
        .addClass('tabs-nav-next')
        .click(function() {
          var tabIndex = parseInt($(this).attr('id').substring($(this).attr('id').lastIndexOf('-') + 1));
          $(elt).triggerTab(tabIndex + 1);
          Drupal.scrollTo(elt);
          return false;
        });
      tabContent.append(link);
    }
    tabContent.append('<span class="clear"></span>')
  }
}

Drupal.tabsLocalTasks = function(elt) {
  var elt = elt ? elt : document;
  // Process standard Drupal local task tabs.
  // Only proceed if we have dynamicload available.
  if (Drupal.settings && Drupal.settings.tabs && Drupal.dynamicload && typeof(Drupal.dynamicload == 'function')) {

    $(elt).find('ul.tabs.primary')
      .each(function() {
        var index = 1;
        var activeIndex;
        $(this).addClass('anchors')
        .addClass('tabs-processed')
        .find('li > a')
        .each(function () {
          var div = document.createElement('div');
          $(div)
            .attr('id', 'section-' + index)
            .addClass('fragment');
          var parentDiv = $(this).parents('div').get(0);
          parentDiv.appendChild(div);
          // The active tab already has content showing.
          if ($(this).is('.active')) {
            activeIndex = parseInt(index);
          }
          // Other tabs need to load their content.
          else {
            Drupal.dynamicload(this, {
              target: document.getElementById('section-' + index),
              useClick: false,
              show: false
            });
          }
          $(this).attr('href', '#section-' + index);
          index++;
        })
        .end()
        .parent('div')
        .each(function() {
          while (this.nextSibling) {
            var oldDiv = this.parentNode.removeChild(this.nextSibling);
            document.getElementById('section-' + activeIndex).appendChild(oldDiv);
          }
        })
        .tabs({
          onShow: Drupal.tabsAddClassesCallback()
        });
    });
  }
};
