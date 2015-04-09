// $Id: jstools.js,v 1.9.2.9 2008/06/19 21:30:25 nedjo Exp $

Drupal.behaviors = Drupal.behaviors || {};

/**
 * Attach registered behaviors.
 */
Drupal.attachBehaviors = function(context) {
  context = context || document;
  if (Drupal.jsEnabled && Drupal.behaviors) {
    // Execute all of them.
    jQuery.each(Drupal.behaviors, function() {
      this(context);
    });
  }
};

Drupal.preventSelect = function (elt) {
  // IE hack to prevent selection of the text when users click.
  if (document.onselectstart) {
    elt.onselectstart = function () {
      return false;
    }
  }
  else {
    $(elt).mousedown(function () {
      return false;
    });
  }
};

/**
 * Returns an event's source element.
 */
Drupal.getTarget = function (e) {	
  if (!e) e = window.event;	
  var target = e.target ? e.target : e.srcElement;
  if (!target) return null;
  if (target.nodeType == 3) target = target.parentNode; // safari weirdness		
  if (target.tagName.toUpperCase() == 'LABEL' && e.type == 'click') { 
    // When clicking a label, firefox fires the input onclick event
    // but the label remains the source of the event. In Opera and IE 
    // the source of the event is the input element.
    if (target.getAttribute('for')) {
      target = document.getElementById(target.getAttribute('for'));
    }
  }
  return target;
};

Drupal.url = function (path, query, fragment) {
  query = query ? query : '';
  fragment = fragment ? '#' + fragment : '';
  var base = Drupal.settings.jstools.basePath;
  if (!Drupal.settings.jstools.cleanurls) {
    if (query) {
      return base + '?q=' + path + '&' + query + fragment;
    }
    else {
      return base + '?q=' + path + fragment;
    }
  }
  else {
    if (query) {
      return base + path + '?' + query + fragment;
    }
    else {
      return base + path + fragment;
    }
  }
};

/**
 * Return the Drupal path portion of an href.
 */
Drupal.getPath = function (href) {
  href = Drupal.pathPortion(href);
  // 3 is the length of the '?q=' added to the url without clean urls.
  href = href.substring(Drupal.settings.jstools.basePath.length + (Drupal.settings.jstools.cleanurls ? 0 : 3), href.length);
  var chars = ['#', '?', '&'];
  for (i in chars) {
    if (href.indexOf(chars[i]) > -1) {
      href = href.substr(0, href.indexOf(chars[i]));
    }
  }
  return href;
};

/**
 * Add a segment to the beginning of a path.
 */
Drupal.prependPath = function (href, segment) {
  href = Drupal.pathPortion(href);
  // 3 is the length of the '?q=' added to the url without clean urls.
  var baseLength = Drupal.settings.jstools.basePath.length + (Drupal.settings.jstools.cleanurls ? 0 : 3);
  var base = href.substring(0, baseLength);
  return base + segment + '/' + href.substring(baseLength, href.length);
};

/**
 * Strip off the protocol plus domain from an href.
 */
Drupal.pathPortion = function (href) {
  // Remove e.g. http://example.com if present.
  var protocol = window.location.protocol;
  if (href.substring(0, protocol.length) == protocol) {
    // 2 is the length of the '//' that normally follows the protocol
    href = href.substring(href.indexOf('/', protocol.length + 2));
  }
  return href;
};

/**
 * Redirects a form submission to a hidden iframe and displays the result
 * in a given wrapper. The iframe should contain a call to
 * window.parent.iframeHandler() after submission.
 */
Drupal.redirectFormSubmit = function (uri, form, handler) {
  $(form).submit(function() {
    // Create target iframe
    Drupal.createIframe();

    // Prepare variables for use in anonymous function.
    var form = this;

    // Redirect form submission to iframe
    this.action = uri;
    this.target = 'redirect-target';

    handler.onsubmit();

    // Set iframe handler for later
    window.iframeHandler = function () {
      var iframe = $('#redirect-target').get(0);

      // Get response from iframe body
      try {
        response = (iframe.contentWindow || iframe.contentDocument || iframe).document.body.innerHTML;
        // Firefox 1.0.x hack: Remove (corrupted) control characters
        response = response.replace(/[\f\n\r\t]/g, ' ');
        if (window.opera) {
          // Opera-hack: it returns innerHTML sanitized.
          response = response.replace(/&quot;/g, '"');
        }
      }
      catch (e) {
        response = null;
      }

      response = Drupal.parseJson(response);
      // Check response code
      if (response.status == 0) {
        handler.onerror(response.data);
        return;
      }
      handler.oncomplete(response.data);

      return true;
    };

    return true;
  });
};

/**
 * Scroll to a given element's vertical page position.
 */
Drupal.scrollTo = function(el) {
  var pos = Drupal.absolutePosition(el);
  window.scrollTo(0, pos.y);
};

Drupal.elementChildren = function (element) {
  var children = [];
  for (i in element) {
    if (i.substr(0, 1) != '#') {
      children[children.length] = i;
    }
  }
  return children;
};

Drupal.elementProperties = function (element) {
  var properties = [];
  for (i in element) {
    if (i.substr(0, 1) == '#') {
      properties[properties.length] = i;
    }
  }
  return properties;
};

Drupal.parseQueryString = function (href) {
  query = Drupal.getQueryString(href);
  var args = {};
  var pairs = query.split("&");
  for(var i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf('=');
    if (pos == -1) continue;
    var argname = pairs[i].substring(0, pos);
    var value = pairs[i].substring(pos + 1);
    args[argname] = unescape(value.replace(/\+/g, " "));
  }
  return args;
};

Drupal.getQueryString = function (href) {
  if (href) {
    var index = href.indexOf('?');
    href = (index == -1) ? '' : href.substring(index + 1);
  }
  query = href ? href : location.search.substring(1);
  if (!Drupal.settings.jstools.cleanurls) {
    var index = query.indexOf('&');
    query = (index == -1) ? '' : query.substring(index + 1);
  }
  return query;
};

Drupal.pathMatch = function (path, paths, type) {
  // Convert paths into a regular expression.
  paths = '^' + paths + '$';
  paths = paths.replace(/\n/g, '$|^');
  paths = paths.replace(/\*/g, '.*');
  var search = path.search(new RegExp(paths)) > -1 ? true : false;
  return (type == 0) ? search : !search;
};

if (Drupal.jsEnabled) {
  // 'js enabled' cookie
  document.cookie = 'has_js=1';
  // Attach all behaviors.
  $(document).ready(function(){
    Drupal.attachBehaviors(this);
  });
}