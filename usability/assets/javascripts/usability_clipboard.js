jQuery.event.props.push('clipboardData');

RMPlus.Usability = (function (my) {
  var my = my || {};

  my.pasteImageName = function(e, name) {
    var text = '!' + name + '! ';
    var scrollPos = e.scrollTop;
    var method = ((e.selectionStart || e.selectionStart == '0') ? 1 : (document.selection ? 2 : false ) );
    if (method == 2) {
      e.focus();
      var range = document.selection.createRange();
      range.moveStart ('character', -e.value.length);
      strPos = range.text.length;
    }
    else if (method == 1) strPos = e.selectionStart;

    var front = (e.value).substring(0,strPos);
    var back = (e.value).substring(strPos,e.value.length);
    if (front.length == 0 || front.slice(-1) == '\n') {
      e.value=front+text+back;
    } else {
      e.value=front+' '+text+back;
    }
    strPos = strPos + text.length;
    if (method == 2) {
      e.focus();
      var range = document.selection.createRange();
      range.moveStart ('character', -e.value.length);
      range.moveStart ('character', strPos);
      range.moveEnd ('character', 0);
      range.select();
    }
    else if (method == 1) {
      e.selectionStart = strPos;
      e.selectionEnd = strPos;
      e.focus();
    }
    e.scrollTop = scrollPos;
  }

  /**
  * Some browser doesn't support cliboardData.items, so this function recreates a simpler version of it
  * by getting the blob linked to the image.
  * Currently only works when copying an image from a webpage
  */
  my.getDataItems = function(clipboardData, editElement, event, input) {
    clipboardData.items = [];
    for(var i = 0; i < clipboardData.types.length; i++) {
      var data = clipboardData.getData(clipboardData.types[i]);
      if (clipboardData.types[i] == "text/html") {
        $('<div>' + data + '</div>').find('img').each(function( ) {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener('load', function(){
            if (xhr.status == 200) {
              //Do something with xhr.response (not responseText), which should be a Blob
              var item = {};
              item.getAsFile = function() { return xhr.response; }
              item.type = xhr.response.type;
              clipboardData.items.push(item);
              my.processClipboardItems(clipboardData, editElement, event, input);
            }
          });
          xhr.open('GET', this.src);
          xhr.responseType = 'blob';
          xhr.send(null);
        });
      }
      else if(clipboardData.types[i] == "text/plain") {
        var file_regexp = /file:\/\/.*/;
        var regexp = new RegExp(file_regexp);
        if (data.match(regexp)) {
          alert('Your browser does not support pasting images from disk. Please use the upload form.');
        }
      }
    }
  };

  my.processClipboardItems = function(clipboardData, editElement, event, input) {
    for (var file = 0; file < clipboardData.items.length; file ++) {
      if (clipboardData.items[file].type.indexOf('image/') != -1) {
        /* Get file name and type details */
        var ext = '';
        switch (clipboardData.items[file].type)
        {
          case 'image/gif':
              ext = '.gif';
              break;
          case 'image/jpeg':
          case 'image/jpg':
          case 'image/pjpeg':
              ext = '.jpg';
              break;
          case 'image/png':
              ext = '.png';
              break;
          case 'image/svg+xml':
          case 'image/svg':
              ext = '.svg';
              break;
          case 'image/tiff':
          case 'image/tif':
              ext = '.tiff';
              break;
          case 'image/bmp':
          case'image/x-bmp':
          case 'image/x-ms-bmp':
              ext = '.bmp';
              break;
        }
        if (ext != '') {
          var fileinput = input.get(0);
          var timestamp = Math.round(+new Date() / 1000);
          var curr_attachment_id = addFile.nextAttachmentId;
          var name = 'screenshot_' + curr_attachment_id + '_' + timestamp + ext;

          /* Upload pasted image */
          var blob = clipboardData.items[file].getAsFile();
          blob.name = name; /* Not very elegent, but we pretent the Blob is actually a File */
          uploadAndAttachFiles([blob], fileinput);

          // override File.name for cases File.name really read-only
          $('#attachments_' + curr_attachment_id).find('input[name="attachments[' + curr_attachment_id + '][filename]"]').val(name);

          /* Inset text into input */
          my.pasteImageName(editElement, name);
        }

        event.preventDefault();
        event.stopPropagation();
        break;
      }
    }
  };

  return my;
})(RMPlus.Usability || {});


$(document).ready(function() {
  $(document.body).on('paste', '.wiki-edit', function (e) {
    var input = undefined;
    if ((input = $(this).parents(['#sd_button_panel', '.request_comment_form', 'div.box:visible:first']).find('input:file:first')).length != 1) { return; }
    var clipboardData;
    if (document.attachEvent) { clipboardData = window.clipboardData; }
    else { clipboardData = e.clipboardData || e.originalevent.clipboardData; }

    if (!clipboardData.items) {
      RMPlus.Usability.getDataItems(clipboardData, this, e, input);
    }
    else {
      RMPlus.Usability.processClipboardItems(clipboardData, this, e, input);
    }
  });

  $(document.body).on('click', '#attachments_fields input.filename.readonly', function() {
    RMPlus.Usability.pasteImageName($(this).parents(['#sd_button_panel', '.request_comment_form', 'div.box:visible:first']).find('textarea.wiki-edit:visible:last').get(0), this.value)
  });
});