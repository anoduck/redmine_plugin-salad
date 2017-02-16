RMPlus.Menu = (function(my){
  var my = my || {};

  my.touch_scaling = false;

  my.sum_counters = function () {
    $('#top-menu>ul>li.dropdown>a>span.count').remove();
    $('#top-menu>ul>li.dropdown').each(function (index) {
      var menu_item = $(this);
      var c_default = 0; //$('<span class="count">0</count>');
      var c_unread = 0; //$('<span class="count unread">0</count>');
      var c_updated = 0; //$('<span class="count updated">0</count>');
      menu_item.find('.dropdown-menu span.count').each(function (index) {
        var c = $(this);
        var num = parseInt(c.text());
        if (!isNaN(num)) {
          if (c.hasClass('unread')) {
            c_unread += num;
          } else if (c.hasClass('updated')) {
            c_updated += num;
          } else {
            c_default += num;
          }
        }
      });
      var a = menu_item.find('a:first');

      // if (c_updated > 0) {
      //   $('<span class="count updated">'+c_updated.toString()+'</count>').insertAfter(a);
      // }
      // if (c_unread > 0) {
      //   $('<span class="count unread">'+c_unread.toString()+'</count>').insertAfter(a);
      // }
      // if (c_default > 0) {
      //   $('<span class="count">'+c_default.toString()+'</count>').insertAfter(a);
      // }
      if (c_default > 0) {
        a.append('<span class="ac_counter count">'+c_default.toString()+'</count>');
      }
      if (c_unread > 0) {
        a.append('<span class="count unread">'+c_unread.toString()+'</count>');
      }
      if (c_updated > 0) {
        a.append('<span class="count updated">'+c_updated.toString()+'</count>');
      }

    });
  };

  my.reallocate_top_menu = function () {
    // $('#top-menu li.dropdown').removeClass('open');
    RMPlus.Menu.shrink_q();

    if ($('#q').is(':focus')) {
      RMPlus.Menu.expand_q_if_possible();
    }

    var top_width = $('#top-menu').width();
    var expander_width = $('#top-menu .menu_expander:first').outerWidth();

    if (top_width > $('#account').outerWidth()+24+expander_width && !RMPlus.Utils.mobile) {
      $('#quick-search').show();
    } else {
      $('#quick-search').hide();
    }

    RMPlus.Menu.rebuild_menu();
  };

  my.shrink_q = function () {
    if (typeof $('#q').data('last_width') != 'undefined') {
      $('#q').width($('#q').data('last_width'));
    }
  };

  my.expand_q_if_possible = function () {
    // var ul_width = $('#top-menu>ul').width();
    if ($('#dropdown_top_menu>li').length > 0) {
      return;
    }
    var ul_width = $('#top-menu').width() - $('#account').outerWidth();
    var li_width = 0;
    var q = $('#q');
    $('#top-menu>ul>li').each(function (index) {
      li_width += $(this).outerWidth();
    });
    if (ul_width-li_width > 250-q.outerWidth()) {
      q.data('last_width', q.width());
      q.animate({ width: 250 }, 300, 'swing', RMPlus.Menu.rebuild_menu);
    }
  };

  my.rebuild_menu = function () {
    // $('#top-menu li.dropdown').removeClass('open');

    var dd_width = $('#top-menu>ul .menu_expander:first').width();
    var ul_width = $('#top-menu').width() - $('#account').outerWidth() - dd_width; //$('#top-menu>ul').width(); //inner width of top-menu container
    var li_width = dd_width;

    $('#dropdown_top_menu').hide();
    $('#dropdown_top_menu>li').addClass('I');
    $('#dropdown_top_menu>li').insertBefore('#top-menu .menu_expander');
    $('#top-menu>ul>li:not(.menu_expander)').each(function (index) {
      li_width += $(this).outerWidth();
      if (ul_width < li_width) {
        $(this).appendTo('#dropdown_top_menu');
      }
      $(this).removeClass('I');
    });
    if ($('#dropdown_top_menu>li').length > 0) {
      $('.menu_expander').removeClass('I');
    } else {
      $('.menu_expander').addClass('I');
    }
  };

  my.show_dropdown = function (dropdown, obj) {
    var link = $(obj).offset();
    link.width = $(obj).outerWidth();
    link.height = $(obj).outerHeight();
    dropdown.css('left', link.left - 5 +'px');
    dropdown.css('top', link.top + link.height + 5 + 'px');
    dropdown.show();
  };

  return my;
})(RMPlus.Menu || {});

$(document).ready(function () {
  $('#cm_quick_header_link').appendTo('#header');
  $('#account>ul:first').addClass('nav pull-right');
  $('<ul class="I us_dropdown_menu" id="dropdown_top_menu"></ul>').appendTo(document.body);
  $('<li class="menu_expander"><a href="#" class="icon icon-expand">&nbsp;</a></li>').appendTo('#top-menu>ul:first');

  RMPlus.Menu.sum_counters();
  RMPlus.Menu.rebuild_menu();

  $(document).scroll(function () {
    $('li.dropdown').removeClass('open');
    $('.us_dropdown_menu').hide();
  });



  // menu-handlers triggers block
  // for user preferences
  var user_preferences = [];
  user_preferences['top_menu_event'] = 'mouseclick';
  $('#usability_user_preferences div').each(function () {
    user_preferences[$(this).attr('class')] = $(this).html();
  });


  $('li.dropdown').click(function (event) {
      if ($(event.target).parents('.us_dropdown_menu').length == 0)
        $('.us_dropdown_menu').hide();
  });

  $(document).click(function (event) {
      // if ($(event.target).parents('div.popover').length == 0)
      //   $('.sub_menu').popover('hide');
      if ($(event.target).parents('.us_dropdown_menu').length == 0)
        $('.us_dropdown_menu').hide();
  });


  $(window).on('resize orientationchange gestureend', function () {
    RMPlus.Menu.reallocate_top_menu();
  });

  $(window).on('touchstart', function (e) {
    if (e.originalEvent.touches.length > 1) {
      RMPlus.Menu.touch_scaling = true;
    }
  });

  $(window).on('touchend', function (e) {
    if (RMPlus.Menu.touch_scaling) {
      // usability_reallocate_top_menu();
      RMPlus.Menu.reallocate_top_menu();
      RMPlus.Menu.touch_scaling = false;
    }
  });

  // for ajax_counters plugin
  $(document.body).on('counters_refreshed one_counter_refreshed', function () {
    RMPlus.Menu.sum_counters();
    RMPlus.Menu.reallocate_top_menu();
  });

  $('.icon-expand').click(function() {
    var dropdown = $('#dropdown_top_menu');
    $('li.dropdown').removeClass('open');
    if (dropdown.is(':visible')) {
      dropdown.hide();
    } else {
      RMPlus.Menu.show_dropdown(dropdown, this);
    }
    return false;
  });

  // Create dropdown links menu
  if (RMPlus.Utils.exists('CustomMenu.settings.dropdown_menu_links') && RMPlus.CustomMenu.settings.dropdown_menu_links && $('.controller-my.action-page_layout').length == 0) {
    var first_menu = $('#content>.contextual:first');
    if (first_menu.length == 0) {
      first_menu = $('<div class="contextual cm_contextual"></div>');
      first_menu.prependTo('#content:first');
    }
    first_menu.addClass('cm_contextual');
    var month_selection = first_menu.find('.rmplus_date_links:first');
    if (month_selection.length > 0) {
      $(RMPlus.CustomMenu.links_menu_tag).insertBefore(month_selection);
    }
    else {
      $(RMPlus.CustomMenu.links_menu_tag).appendTo(first_menu);
    }
    var dd_ul = $('#dd-ul');
    var items_selector = ['.move-to-dropdown'];

    if (RMPlus.Utils.exists('CustomMenu.settings.items_move_to_dropdown') && RMPlus.CustomMenu.settings.items_move_to_dropdown.length > 0) {
      // console.dir(RMPlus.CustomMenu.settings.items_move_to_dropdown);

      for (var i = 0; i < RMPlus.CustomMenu.settings.items_move_to_dropdown.length; i++) {
        items_selector.push('.'+RMPlus.CustomMenu.settings.items_move_to_dropdown[i]);
      }
      first_menu.find(items_selector.join(',')).each(function () {
        var el = $(this);
        if (el.text() == el.html()){
          el.html('<span>'+el.addClass('no_line').html()+'</span>');
        }
        dd_ul.append($('<li></li>').append(el));
      });
    }

    var export_links = $('.other-formats a');
    if (export_links.length > 0) {
      dd_ul.append($('<li><hr class="cm-menu-divider"></li>'));
      dd_ul.append($('<li><div class="title title-left">' + RMPlus.CustomMenu.label_export_to_format + '</div></li>'));
      export_links.each(function (index) {
        var el = $(this);
        if (el.text() == el.html()){
          el.html('<span>'+el.addClass('icon no_line').html()+'</span>');
        }
        dd_ul.append($('<li></li>').append(el));
      });
      $('.other-formats').remove();
    }
    if ($('#dd-ul>li').length > 0) {
      $('#cm_contextual_menu').show();
    }
  }

  if (RMPlus.Utils.exists('CustomMenu.settings.hide_bottom_issue_links') && RMPlus.CustomMenu.settings.hide_bottom_issue_links) {
    $('#content>div.issue').nextAll('.contextual:last').remove();
  }

});

