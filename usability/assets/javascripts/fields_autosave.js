RMPlus.Usability = (function(my) {
  var my = my || {};

  my.available_autosave = function() {
    if (!my.settings.use_autosave_fields) { return false; }
    if (!my.settings.autosave_fields_limitation || my.settings.autosave_fields_limitation <= 0) { return false; }
    return true;
  };

  my.available_local_storage = function() {
    if (!localStorage) { return false; }
    try { return 'localStorage' in window && window['localStorage'] !== null; }
    catch (e) { return false; }
  };

  my.available_field_for_autosave = function(field) {
    return field && ((field.tagName == 'INPUT' && field.type == 'text') || field.tagName == 'TEXTAREA');
  };

  my.get_field_selector = function(field) {
    if (field.id) { return '#' + field.id; }

    var selector = field.tagName.toLowerCase();
    if (field.className) { selector += '.' + field.className.replace(' ', '.'); }
    if (field.tagName == 'INPUT') { selector = selector + '[type="' + field.type + '"]'; }
    if (field.name) { selector = selector + '[name="' + field.name + '"]'; }

    return selector;
  };

  my.save_fields_data = function() {
    if (!my.available_autosave()) { return; }
    if (!my.available_local_storage()) { return; }

    var storage = localStorage[window.location.pathname];
    if (storage) { storage = JSON.parse(storage); }
    else { storage = {}; }

    var something_saved = [];

    var fields = my.settings.autosave_fields || '.us-autosave';
    fields = $(fields.replace(/\,/g, ':visible,') + ':visible').get();

    for (var sch = 0; sch < fields.length; sch ++) {
      var field = fields[sch];
      var vl = field.value.trim();

      // just for double
      var field_guid = field.getAttribute('data-guid');
      if (!field_guid) {
        field_guid = my.create_guid();
        field.setAttribute('data-guid', field_guid);
      }

      if (!my.available_field_for_autosave(field)) { continue; }

      var selector = my.get_field_selector(field);
      if (!storage[selector]) { storage[selector] = {}; }

      if (vl) {
        if (storage[selector][field_guid] != vl) {
          something_saved.push(field);
        }
        storage[selector][field_guid] = vl;
      }
      else {
        if (storage[selector][field_guid]) {
          something_saved.push(field);
        }
        delete storage[selector][field_guid];
      }

      // limitation
      var saved_keys = Object.keys(storage[selector]);
      if (saved_keys.length > my.settings.autosave_fields_limitation) {
        for (var sch2 = 0; sch2 < saved_keys.length - my.settings.autosave_fields_limitation; sch2 ++) {
          delete storage[selector][saved_keys[sch2]];
        }
      }
    }

    localStorage[window.location.pathname] = JSON.stringify(storage);

    if (something_saved.length > 0) { my.show_saved_label(something_saved); }
    return localStorage[window.location.pathname];
  };

  my.delete_field_data = function(field, guid) {
    if (!my.available_local_storage()) { return; }

    var storage = localStorage[window.location.pathname];
    if (!storage) { return; }
    storage = JSON.parse(storage);
    var selector = my.get_field_selector(field);
    if (!storage[selector]) { return; }

    if (!guid) { storage[selector] = []; }
    else { delete storage[selector][guid]; }

    return localStorage[window.location.pathname] = JSON.stringify(storage);
  };

  my.create_guid = function() {
    var dt = new Date( ).getTime( );
    var gd = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return gd;
  };


  my.show_saved_label = function(fields) {
    if (!fields || fields.length == 0) { return; }

    for (var sch = 0; sch < fields.length; sch ++) {
      var associated_link = $(fields[sch]).data('link');
      if (!associated_link) {
        if (fields[sch] === document.activeElement) {
          my.show_history_link(fields[sch]);
          associated_link = $(fields[sch]).data('link');
        }
      }
      if (!associated_link) { continue; }
      if (associated_link.hasClass('us-saved')) { continue; }

      var info = $('<span style="display:none;">' + my.msg_autosaved + '</span>');
      associated_link.append(info);
      associated_link.addClass('us-saved');
        info.fadeIn('fast', function() { $(this).delay(1000).fadeOut('fast', function() {
          var $this = $(this);
          var $parent = $this.parent().removeClass('us-saved');
          $this.remove();
          $parent = $parent.data('elem');
          if (!$parent || !$parent[0]) { return; }
          if (!my.field_history($parent[0])) {
            my.hide_history_link($parent[0]);
          }
        });
      });
    }
  };

  my.field_history = function(field) {
    if (!my.available_autosave()) { return false; }
    if (!my.available_local_storage()) { return false; }
    if (!my.available_field_for_autosave(field)) { return false; }

    var storage = localStorage[window.location.pathname];
    if (!storage) { return false; }
    storage = JSON.parse(storage);

    var selector = my.get_field_selector(field);
    if (!storage[selector]) { return false; }

    if (Object.keys(storage[selector]).length == 0) { return false; }

    return storage[selector];
  };

  my.show_history_link = function(elem) {
    var $elem = $(elem);
    if ($elem.data('link')) { return; }

    if (!my.field_history(elem)) { return; }

    var $html = $('<a id="' + my.create_guid() + '" href="#" class="us-history-autosaves no_line link_to_modal click_out static_content_only over_parent_window" style="display:none;"></a>');
    $elem.after($html);
    $html.modal_window();
    $html.click(function() {
      var $window = $(this).data('modal_window').$window;

      var $field = $html.data('elem');
      if (!$field) { return false; }
      var h = my.field_history($field[0]);

      if (!h) { return false; }

      var html = '<table class="list">';

      var keys = Object.keys(h);
      for (var sch = 0; sch < keys.length; sch ++) {
        html += '<tr data-id="' + keys[sch] + '">';
        html += '<td>';
        html += (h[keys[sch]].length > 50 ? (h[keys[sch]].substring(0, 50) + '...') : h[keys[sch]]);
        html += '</td>';
        html += '<td width="1px">';
        html += '<a href="#" class="icon icon-del no_line us-autosave-delete"></a>';
        html += '</td>';
        html += '</tr>';
      }

      html += '</table>';
      $window.html(html);
      $window.addClass('us-autosaved-list');
    });

    $html.fadeIn('fast');
    $elem.data('link', $html);
    $html.data('elem', $elem);
  };

  my.hide_history_link = function(elem) {
    if (!elem) { return; }
    var $elem = $(elem);
    var $assigned_link = $elem.data('link');

    if (my.field_history(elem)) {
      if (elem === document.activeElement || ($assigned_link && $assigned_link[0] === document.activeElement)) {
        return;
      }
    }

    $assigned_link && $assigned_link.fadeOut('fast', function () { $(this).modal_window('destroy').remove(); });
    $elem.removeData('link');
  };

  return my;
})(RMPlus.Usability || {});

$(document).ready(function() {
  if (RMPlus.Usability.available_autosave()) {

    setInterval(RMPlus.Usability.save_fields_data, 30000);

    $(document.body).on('focus', RMPlus.Usability.settings.autosave_fields || '.us-autosave', function() {
      RMPlus.Usability.show_history_link(this);
    });

    $(document.body).on('blur', RMPlus.Usability.settings.autosave_fields || '.us-autosave', function() {
      // we can click to our link, then we do not need to hide link. In this case we will hide link only if was closed modal window and lose focus
      setTimeout($.proxy(function() {
        RMPlus.Usability.hide_history_link(this);
      }, this), 100);
    });

    $(document.body).on('modal_window_hidden', 'a.us-history-autosaves', function() {
      var $elem = $(this).data('elem');
      $elem && RMPlus.Usability.hide_history_link($elem[0]);
    });


    $(document.body).on('click', 'div.modal_window.us-autosaved-list table tr', function() {
      var $this = $(this);
      var $mw = $this.parents('div.modal_window:first');
      if ($mw.length == 0) { return; }

      var $elem = $mw.data('modal_window').$element.data('elem');
      if (!$elem) { return; }

      var text = RMPlus.Usability.field_history($elem[0]);
      if (!text) { return; }
      text = text[$this.attr('data-id')];
      if (!text) { return; }

      $elem.val($elem.val() + ' ' + text).focus();
      $mw.modal_window('hide');
      RMPlus.Usability.hide_history_link($elem[0]);
    });

    $(document.body).on('click', 'a.us-autosave-delete', function(e) {
      e.stopPropagation();

      var $this = $(this);
      var $mw = $this.parents('div.modal_window:first');

      var $item = $this.parents('tr:first');
      if ($item.length == 0) { return false; }

      var $field = $mw.data('modal_window').$element.data('elem');
      if (!$field) { return false; }

      RMPlus.Usability.delete_field_data($field[0], $item.attr('data-id'));
      $item.remove();

      if ($mw.find('table tr').length == 0) {
        $mw.modal_window('hide');
        RMPlus.Usability.hide_history_link($field[0]);
      }

      return false;
    });
  }
});