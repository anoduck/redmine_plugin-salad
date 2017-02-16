$(document).ready(function() {

  RMPlus.CM = (function(my) {
    var my = my || {};

    my.prepare_form = function(elem) {
      var $modal = $('.modal_window.cm-modal-window');
      // after any ajax modal window without linked object will delete
      if ($modal.length == 0) {
        $modal = $('<div class="modal_window cm-modal-window mw-dynamic">' + $('#cm-modal-form').html() + '</div>');
        $(document.body).prepend($modal);
      }

      var id = '';
      if (elem && !elem.attr('id')) {
        elem.attr('id', my.create_guid());
      }
      if (elem) { id = elem.attr('id'); }
      else { id = 'cm-new-item'; }

      $modal.attr('id', 'modal-' + id);
      if (elem) {
        elem = elem.parents('.dd-item:first');


        if(elem.attr('data-type') == 'CmItemCustom'){
          $('#cm-item-field-link').insertAfter('#cm-menu-item-menu');
          $('#cm-item-field-link').show();
          $('#cm-item-field-query').hide();
          $('#cm-item-field-query').appendTo('#cm_storage_for_form');
          var tbody = $('#cm-item-field-link');
          $('#cm-menu-item-menu').find('#cm_item_item_type').val('CmItemCustom');
        }
        if(elem.attr('data-type') == 'CmItemQuery'){
          $('#cm-item-field-link').hide();
          $('#cm-item-field-query').insertAfter('#cm-menu-item-menu');
          $('#cm-item-field-query').show();
          $('#cm-item-field-link').appendTo('#cm_storage_for_form');
          //noinspection JSUnusedLocalSymbols
          var tbody = $('#cm-item-field-query');
          $('#cm-menu-item-menu').find('#cm_item_item_type').val('CmItemQuery');
        }
        $('#cm-menu-item-menu').hide();
        //$('#cm-menu-item-menu').hide().find('select, input').prop('disabled', true);
        tbody.find('#cm_item_caption').val(elem.attr('data-caption'));
        $('#cm_item_custom_url').val(elem.attr('data-custom_url'));
        $('#cm_item_options_class').val(elem.attr('data-options_class'));
        $('#cm_item_logged').prop('checked', elem.attr('data-logged') == 'true');
        $('#cm_item_visibility_public').prop('checked', elem.attr('data-visibility') == '0');
        $('#cm_item_visibility_role').prop('checked', elem.attr('data-visibility') == '1');
        $('#cm_item_visibility_admin').prop('checked', elem.attr('data-visibility') == '2');
        if(!$('#cm_item_query_id').data('select2')){
          $('#cm_item_query_id').select2({allowClear: true, width: '200'});
        }
        tbody.find('#cm_item_query_id').val(elem.attr('data-item-query')).trigger('change');
        var cm_item_role_ids = $('#cm_item_role_ids');
        cm_item_role_ids.find('input[type=checkbox]').prop('checked', false);
        if (elem.attr('data-visibility') == '1' && elem.attr('data-roles')) {
          cm_item_role_ids.find('input[type=checkbox]').prop('disabled', false).filter('input[value=' + elem.attr('data-roles').split(',').join('], input[value=') + ']').prop('checked', true);
        }
        if (elem.attr('data-visibility') == '0') {
          cm_item_role_ids.find('input[type=checkbox]').prop('disabled', true);
        }
        $('#cm-new-menu-item').hide();
        $('#cm-edit-menu-item').show().html(elem.attr('data-caption'));
      } else {
        $('#cm-item-field-link').insertAfter('#cm-menu-item-menu');
        $('#cm-item-field-link').show();
        $('#cm-item-field-query').hide();
        $('#cm-item-field-query').appendTo('#cm_storage_for_form');
        $('#cm-menu-item-menu').show().find('select, input').prop('disabled', false);
        $modal.find('input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"])').val('').trigger('change');
        $modal.find('select').each(function() { this.selectedIndex = 0; });

        $modal.find('input[type="checkbox"]').prop('checked', false);
        $('#cm_item_visibility_public').prop('checked', true);
        $('#cm_item_visibility_role').prop('checked', false);
        $('#cm_item_visibility_admin').prop('checked', false);
        $('#cm_item_role_ids').find('input[type=checkbox]').prop('disabled', true);

        $('#cm-new-menu-item').show();
        $('#cm-edit-menu-item').hide();
      }
    };

    my.generate_custom_item = function(form, can_delete) {
      var html = '';
      var data = RMPlus.CM.serialize_form_data(form);

      html += '<li class="dd-item"';
      html += ' data-nodeid="nst-' + my.create_guid() + '"';

      html += ' data-type="' + data['cm_item[item_type]'] + '"';
      html += ' data-caption="' + data['cm_item[caption]'] + '"';

      if(data['cm_item[item_type]'] == 'CmItemCustom'){
        html += ' data-custom_url="' + data['cm_item[custom_url]'] + '"';
        html += ' data-options_class="' + data['cm_item[options][class]'] + '"';
        html += ' data-logged="' + data['cm_item[logged]'] + '"';
        html += ' data-visibility="' + data['cm_item[visibility]'] + '"';

        if (data['cm_item[role_ids][]']) {
          html += ' data-visibility="' + data['cm_item[visibility]'] + '"';
          html += ' data-roles="' + data['cm_item[role_ids][]'].join(',') + '"';
        } else {
          html += ' data-visibility="0"';
        }

      }

      if(data['cm_item[item_type]'] == 'CmItemQuery'){
        html += ' data-item-query="' + data['cm_item[query_id]'] + '"';
        html += ' data-visibility="0"';
      }

      html += '>';

      html += '<div class="dd-content dd-buttunable"><div class="dd-handle"></div>';
      html += data['cm_item[caption]'];

      html += '<div class="dd-right">';

      html += '<a href="#" class="icon icon-edit cm-edit link_to_modal"></a>';

      if (can_delete) {
        html += '<a href="#" class="icon icon-del cm-del"></a>';
      }

      html += '</div>';
      html += '</div>';
      html += '</li>';

      html = $(html);
      html.find('.cm-edit').click(my.click_edit_event);
      return html;
    };

    my.remove_item = function(elem) {
      if (!elem || elem.length == 0) { return; }
      if (!elem.attr('data-code')) {
        elem.fadeOut(300, function() {
          var parent = $(this).parents('li.dd-item:first');
          var root = $(this).parents('.dd.cm-managing:first');

          $(this).remove();

          my.recalculate_del_button(parent);
          my.recalculate_empty(root);
        });
        return;
      }

      var dest = $('#cm-admin-items li.dd-item[data-code="' + elem.attr('data-code') + '"]');
      var cloned = true;
      if (dest.length == 0) {
        dest = $('#cm-admin-items');
        cloned = false;
      }

      var ps = dest.offset();
      var margins = {
        left: (parseInt(dest.css("marginLeft"),10) || 0),
        top: (parseInt(dest.css("marginTop"),10) || 0)
      };

      var it_ps = elem.offset();
      var it_margins = {
        left: (parseInt(elem.css("marginLeft"),10) || 0),
        top: (parseInt(elem.css("marginTop"),10) || 0)
      };
      elem.css({ position: 'absolute', width: elem.width(), height: elem.height(), top: it_ps.top - it_margins.top, left: it_ps.left - it_margins.left, zIndex: 500 });

      var parent = elem.parents('li.dd-item:first');
      var root = elem.parents('.dd.cm-managing:first');
      $(document.body).append(elem);

      elem.find('.dd-right').remove();
      elem.removeClass('dd-buttunable');
      elem.find('ul.dd-list').remove();

      elem.animate({ left: ps.left - margins.left, top: ps.top - margins.top + (cloned ? 0 : dest.height()), opacity: 0.2 }, 500, 'swing', function() {
        var $this = $(this).removeAttr('style data-id');
        if (cloned) {
          $this.remove();
        } else {
          $('#cm-admin-items ul.dd-list:first').append($this);
        }
        my.recalculate_del_button(parent);
        my.recalculate_empty(root);
      });
    };

    my.recalculate_empty = function(nestable) {
      if (nestable.find('li.dd-item').length == 0) {
        if (nestable.find('.dd-empty').length == 0) {
          nestable.find('.dd-list').remove();

          var empty = $('<div class="dd-empty" style="display:none;"></div>');
          nestable.append(empty);
          empty.fadeIn(200);
        }
      } else {
        nestable.find('.dd-empty').remove();
      }
    };

    my.recalculate_del_button = function(elem) {
      if (!elem || elem.length == 0 || elem[0].tagName != 'LI') { return; }

      if (elem.find('.dd-item').length > 0) {
        elem.find('.dd-content:first .cm-del').remove();
        if (elem.find('.dd-content:first .dd-right:empty').remove().length > 0) { elem.find('.dd-content:first').removeClass('dd-buttunable'); }
        elem.find('a:first').addClass('in_link');
        return;
      }

      elem = elem.find('.dd-content').addClass('dd-buttunable');
      elem.find('a:first').removeClass('in_link');
      var cont = elem.find('.dd-right');
      if (cont.length == 0) {
        cont = $('<div class="dd-right"></div>');
        elem.append(cont);
      } else if (cont.find('.cm-del').length > 0) {
        return;
      }
      var del = $('<a href="#" class="icon icon-del cm-del show_loader no_line" data-confirm="' + $('#cm-admin-items').attr('data-confirm') + '"></a>');
      cont.append(del);
    };

    my.create_item = function(form) {
      var elem, parent, menu;

      menu = form.find('select[name="cm_item[menu]"]').val();
      elem = RMPlus.CM.generate_custom_item(form, true);
      parent = $('#cm-manage-' + menu);

      var list = parent.find('ul.dd-list:first');
      if (list.length == 0) {
        list = $('<ul class="dd-list"></ul>');
        parent.append(list);
      }
      list.append(elem);
      my.recalculate_del_button(parent);
      my.recalculate_empty($('#cm-manage-' + menu));
      elem.fadeIn(200, function() { $(this).find('.dd-content').effect('highlight'); });
    };

    my.update_item = function(elem, form) {
      if (!elem || elem.length == 0) { return; }

      var $tmp = RMPlus.CM.generate_custom_item(form, elem.find('.dd-item').length == 0);
      $tmp.append(elem.find('ul.dd-list:first'));

      elem.replaceWith($tmp);

      $tmp.find('.dd-content:first').effect('highlight');
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

    my.serialize_form_data = function(form) {
      var o = {};
      var a = form.serializeArray();
      $.each(a, function() {
         if (this.name != 'cm_item[logged]' && o[this.name]) {
           if (!Array.isArray(o[this.name])) { o[this.name] = [o[this.name]]; }
           if (this.value) {
             o[this.name].push(this.value);
           }
         } else {
           o[this.name] = this.value || '';
         }
      });
      return o;
    };

    my.click_edit_event = function() {
      RMPlus.CM.prepare_form($(this));
    };

    return my;
  })(RMPlus.CM || {});


  $('#cm-admin-items .count, .dd.cm-managing .count, .dd.cm-managing .count').removeAttr('data-id').removeAttr('data-url').html('10');

  $('#cm-admin-items').nestable({
    maxDepth: 1,
    listNodeName: 'ul',
    canSortIn: false,
    group: 1
  }).disableSelection().on('change', function(event, elem, source_elem, dest_elem, depth) {
    if (!source_elem || !dest_elem || source_elem[0] === dest_elem[0]) { return; }
    // only if added elem

    elem.removeAttr('data-clone');
    elem.attr('data-nodeid', 'nst-' + RMPlus.CM.create_guid());
    RMPlus.CM.recalculate_del_button(elem);
    RMPlus.CM.recalculate_del_button(elem.parents('li.dd-item:first'));
  });

  $('.dd.cm-managing').nestable({
    maxDepth: 2,
    listNodeName: 'ul',
    group: 1
  }).on('change', function(event, elem, source_elem, dest_elem, depth, prev_parent) {
    elem.removeClass('cm-error');
    var parent = elem.parents('.dd-item:first');
    RMPlus.CM.recalculate_del_button(elem);
    RMPlus.CM.recalculate_del_button(parent);
    RMPlus.CM.recalculate_del_button(prev_parent);
  }).disableSelection();

  $(document.body).on('click', '#cm-admin-items li.dd-item a, .dd.cm-managing li.dd-item a:not(.icon-del):not(.icon-edit)', function() {
    return false;
  });

  $(document.body).on('click', '.dd.cm-managing li.dd-item a.cm-del', function() {
    if (!confirm($('#cm-admin-items').attr('data-confirm'))) { return false; }
    RMPlus.CM.remove_item($(this).parents('li.dd-item:first'));
    return false;
  });

  $('.dd.cm-managing li.dd-item a.cm-edit').click(RMPlus.CM.click_edit_event);

  $('#cm-new-item').click(function() {
    RMPlus.CM.prepare_form();
  });

  $(document.body).on('submit', '#cm-menu-form', function() {
    var $mw = $(this).closest('.modal_window');
    if ($('#cm-new-menu-item').is(':visible')) {
      RMPlus.CM.create_item($(this));
    } else {
      RMPlus.CM.update_item($mw.data('modal_window').$element.parents('.dd-item:first'), $(this));
    }
    $mw.modal_window('hide');
    return false;
  });

  $(document.body).on('click', '#cm-save-structure', function() {
    $(document.body).data('ajax_emmiter', $(this));
    var top_data = $('#cm-manage-top_menu').nestable('serialize');
    var account_data = $('#cm-manage-account_menu').nestable('serialize');

    $.ajax({ type: 'POST', url: RMPlus.Utils.relative_url_root + '/cm_menu/rebuild_menu', data: { top_menu: top_data, account_menu: account_data } });
    return false;
  });

  $(document.body).on('change', '#cm_item_item_type', function() {
    if(this.value == 'CmItemCustom'){
      $('#cm-item-field-link').insertAfter('#cm-menu-item-menu');
      $('#cm-item-field-link').show();
      $('#cm-item-field-query').hide();
      $('#cm-item-field-query').appendTo('#cm_storage_for_form');
    }
    if(this.value == 'CmItemQuery'){
      $('#cm-item-field-link').hide();
      $('#cm-item-field-query').insertAfter('#cm-menu-item-menu');
      $('#cm-item-field-query').show();
      $('#cm-item-field-link').appendTo('#cm_storage_for_form');
      if(!$('#cm_item_query_id').data('select2')){
        $('#cm_item_query_id').select2({allowClear: true, width: '200'});
      }
      $('#cm-item-field-query').find('#cm_item_query_id').val('').trigger('change');
    }
    //var $modal = $('.modal_window.cm-modal-window');
    //$modal.data('modal_window').show()
  });

  $(document.body).on('change', 'input[name="cm_item[visibility]"]', function() {
    $('#cm_item_role_ids').find('input[type=checkbox]').prop('disabled', this.value != '1').prop('checked', false);
  });

  $("#cm-admin-items").disableSelection();
});