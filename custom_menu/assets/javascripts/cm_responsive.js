RMPlus.Menu = (function(my){ var my = my || {}; return my; })(RMPlus.Menu || {});;
RMPlus.Menu.Responsive = (function(my){
  var my = my || {};
  my.resize_timeout = null;
  my.$html = $('html');
  my.state = undefined;
  my.once_init = false;

  my.show_flyout = function() {
    my.$html.addClass('flyout-is-active');
  };
  my.hide_flyout = function() {
    my.$html.removeClass('flyout-is-active');
  };
  my.toggle_flyout = function() {
    if (my.$html.hasClass('flyout-is-active')) {
      my.hide_flyout();
    } else {
      my.show_flyout();
    }
  };

  my.is_responsive = function() {
    return $('.mobile-toggle-button').is(":visible");
  };

  my.init_responsive = function() {
    my.hide_flyout();
    if (!my.once_init) {
      my.replace_account_menu();
      my.replace_project_menu();
      my.replace_general_menu();
      my.replace_sidebar_menu();
    }
    my.state = 1;
    my.once_init = true;
  };

  my.init_desktop = function() {
    my.hide_flyout();
    my.state = 0;
  };

  my.replace_account_menu = function() {
    var $account_menu = $('#account > .cm-menu-header').clone();
    $account_menu.find('#cm-search-box').closest('li').remove();

    $account_menu.removeAttr('class').addClass('cm-js-menu-header');
    $account_menu.find('.dropdown-toggle').removeClass('dropdown-toggle').addClass('cm-dropdown-toggle');
    $account_menu.find('.dropdown-menu').removeClass('dropdown-menu').addClass('cm-dropdown-menu');
    $account_menu.find('.dropdown').removeClass('dropdown').addClass('cm-dropdown');
    $account_menu.find('a:not(:has(span))').wrapInner('<span></span>');
    $account_menu = $('<div class="js-account-menu"></div>').append($account_menu);
    var $replacer = $('.flyout-menu__avatar');
    if ($replacer.length == 0) {
      $('.flyout-menu.js-flyout-menu').prepend($account_menu);
    } else {
      $replacer.replaceWith($account_menu);
    }

    $('.js-profile-menu').prev('h3').remove();
    $('.js-profile-menu').remove();
  };

  my.replace_project_menu = function() {
    var $project_menu = $('#main-menu > ul').clone();
    $project_menu.addClass('cm-js-menu-header');
    $project_menu.find('a').removeClass('selected');
    $project_menu.find('a:not(:has(span))').wrapInner('<span></span>');
    $project_menu = $('<div class="js-project-menu"></div>').append($project_menu);
    $('.js-project-menu').replaceWith($project_menu);
  };

  my.replace_general_menu = function() {
    var $general_menu = $('#top-menu > .cm-menu-header').clone();
    $general_menu.removeAttr('class').addClass('cm-js-menu-header');
    $general_menu.find('.dropdown-toggle').removeClass('dropdown-toggle').addClass('cm-dropdown-toggle');
    $general_menu.find('.dropdown-menu').removeClass('dropdown-menu').addClass('cm-dropdown-menu');
    $general_menu.find('.dropdown').removeClass('dropdown').addClass('cm-dropdown');
    $general_menu.find('a:not(:has(span))').wrapInner('<span></span>');

    $general_menu = $('<div class="js-general-menu"></div>').append($general_menu);
    $('.js-general-menu').replaceWith($general_menu);
  };

  my.replace_sidebar_menu = function() {
    var $sidebar_menu = $('#sidebar > *').clone();
    $sidebar_menu.find('a:not(:has(span))').wrapInner('<span></span>');
    $sidebar_menu.find('a').each(function() {
      var $this = $(this);
      var $next = $this.nextAll('span');
      if ($next.length > 0) {
        $this.append($next);
      }
    });
    $sidebar_menu = $('<div class="js-sidebar"></div>').append($sidebar_menu);
    $('.js-sidebar').replaceWith($sidebar_menu);
  };

  my.setup_responsive = function() {
    if (my.is_responsive()) {
      if (my.state != 1) {
        my.init_responsive();
      }
    } else {
      if (my.state != 0) {
        my.init_desktop();
      }
    }
  };

  return my;
})(RMPlus.Menu.Responsive || {});

$(document).ready(function() {
  RMPlus.Menu.Responsive.setup_responsive();

  $(document.body).on('click', '.mobile-toggle-button', function(e) {
    e.preventDefault();
    e.stopPropagation();
    RMPlus.Menu.Responsive.toggle_flyout();
  });

  $(document.body).on('click', 'div[id^=wrapper]', function(e) {
    if (RMPlus.Menu.Responsive.is_responsive()) {
      if(!e.target.closest('.flyout-menu') && $("html").hasClass("flyout-is-active")){
        e.preventDefault();
        e.stopPropagation();
        RMPlus.Menu.Responsive.hide_flyout();
      }
    }
  });

  $(window).resize(function() {
    if (RMPlus.Menu.Responsive.resize_timeout) {
      window.clearTimeout(RMPlus.Menu.Responsive.resize_timeout);
    }

    RMPlus.Menu.Responsive.resize_timeout = window.setTimeout(function() {
      RMPlus.Menu.Responsive.setup_responsive();
    }, 100);
  });
});