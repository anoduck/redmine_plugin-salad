/*!
 * Nestable jQuery Plugin - Copyright (c) 2012 David Bushell - http://dbushell.com/
 * Dual-licensed under the BSD or MIT licenses
 */
;(function($, window, document, undefined)
{
    var hasTouch = 'ontouchstart' in document;

    /**
     * Detect CSS pointer-events property
     * events are normally disabled on the dragging element to avoid conflicts
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
     */
    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

    var defaults = {
            listNodeName    : 'ol',
            itemNodeName    : 'li',
            rootClass       : 'dd',
            listClass       : 'dd-list',
            itemClass       : 'dd-item',
            dragClass       : 'dd-dragel',
            handleClass     : 'dd-handle',
            collapsedClass  : 'dd-collapsed',
            placeClass      : 'dd-placeholder',
            noDragClass     : 'dd-nodrag',
            emptyClass      : 'dd-empty',
            contentClass    : 'dd-content',
            expandBtnHTML   : '<button data-action="expand" type="button">Expand</button>',
            collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
            group           : 0,
            maxDepth        : 5,
            threshold       : 20,
            canSortIn       : true,
            clone           : false
        };

    function Plugin(element, options)
    {
        this.w  = $(document);
        this.el = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {

        init: function()
        {
            var list = this;

            list.reset();

            list.el.data('nestable-group', this.options.group);
            list.el.data('nestable-max-depth', this.options.maxDepth);
            list.el.data('nestable-can-sort-in', this.options.canSortIn);

            list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

            $.each(this.el.find(list.item_selector(true)), function(k, el) {
                list.setParent($(el));
            });

            list.el.on('click', 'button', function(e) {
                if (list.dragEl) {
                    return;
                }
                var target = $(e.currentTarget),
                    action = target.data('action'),
                    item   = target.parent(list.item_selector());
                if (action === 'collapse') {
                    list.collapseItem(item);
                }
                if (action === 'expand') {
                    list.expandItem(item);
                }
            });

            var onStartEvent = function(e)
            {
                var handle = $(e.target);
                if (!handle.hasClass(list.options.handleClass)) {
                    if (handle.closest('.' + list.options.noDragClass).length) {
                        return;
                    }
                    handle = handle.closest('.' + list.options.handleClass);
                }

                if (!handle.length || list.dragEl) {
                    return;
                }

                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }

                e.preventDefault();
                list.dragStart(e.touches ? e.touches[0] : e);
            };

            var onMoveEvent = function(e)
            {
                if (list.dragEl && list.moving) {
                    e.preventDefault();
                    list.dragMove(e.touches ? e.touches[0] : e);
                }
            };

            var onEndEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragStop(e.touches ? e.touches[0] : e);
                }
            };

            if (hasTouch) {
                list.el[0].addEventListener('touchstart', onStartEvent, false);
                window.addEventListener('touchmove', onMoveEvent, false);
                window.addEventListener('touchend', onEndEvent, false);
                window.addEventListener('touchcancel', onEndEvent, false);
            }

            list.el.on('mousedown', onStartEvent);
            list.w.on('mousemove', onMoveEvent);
            list.w.on('mouseup', onEndEvent);

        },
        item_selector: function(all) {
          return this.options.itemNodeName + '.' + this.options.itemClass + (all ? '' : ':first');
        },
        parent_list_selector: function(all) {
          return this.options.listNodeName + '.' + this.options.listClass + (all ? '' : ':first');
        },
        serialize: function()
        {
            var data,
                depth = 0,
                list  = this;
                step  = function(level, depth)
                {
                    var array = [ ],
                        items = level.children(list.item_selector(true));
                    items.each(function()
                    {
                        var li   = $(this),
                            item = $.extend({}, li.data()),
                            sub  = li.children(list.parent_list_selector(true));
                        if (sub.length) {
                            item.children = step(sub, depth + 1);
                        }
                        array.push(item);
                    });
                    return array;
                };
            data = step(list.el.find(list.parent_list_selector()).first(), depth);
            return data;
        },

        serialise: function()
        {
            return this.serialize();
        },

        reset: function()
        {
            this.mouse = {
                offsetX   : 0,
                offsetY   : 0,
                startX    : 0,
                startY    : 0,
                lastX     : 0,
                lastY     : 0,
                nowX      : 0,
                nowY      : 0,
                distX     : 0,
                distY     : 0,
                dirAx     : 0,
                dirX      : 0,
                dirY      : 0,
                lastDirX  : 0,
                lastDirY  : 0,
                distAxX   : 0,
                distAxY   : 0
            };
            this.isTouch    = false;
            this.moving     = false;
            this.dragEl     = null;
            this.dragRootEl = null;
            this.dragDepth  = 0;
            this.hasNewRoot = false;
            this.pointEl    = null;
            this.margins    = null;
        },

        expandItem: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action="expand"]').hide();
            li.children('[data-action="collapse"]').show();
            li.children(this.parent_list_selector(true)).show();
        },

        collapseItem: function(li)
        {
            var lists = li.children(this.parent_list_selector(true));
            if (lists.length) {
                li.addClass(this.options.collapsedClass);
                li.children('[data-action="collapse"]').hide();
                li.children('[data-action="expand"]').show();
                li.children(this.parent_list_selector(true)).hide();
            }
        },

        expandAll: function()
        {
            var list = this;
            list.el.find(list.item_selector(true)).each(function() {
                list.expandItem($(this));
            });
        },

        collapseAll: function()
        {
            var list = this;
            list.el.find(list.item_selector(true)).each(function() {
                list.collapseItem($(this));
            });
        },

        setParent: function(li)
        {
            if (li.children(this.parent_list_selector(true)).length) {
                li.prepend($(this.options.expandBtnHTML));
                li.prepend($(this.options.collapseBtnHTML));
            }
            li.children('[data-action="expand"]').hide();
        },

        unsetParent: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action]').remove();
            li.children(this.parent_list_selector(true)).remove();
        },

        dragStart: function(e)
        {
            var mouse    = this.mouse,
                target   = $(e.target),
                dragItem = target.closest(this.item_selector(true));

            this.placeEl.css('height', dragItem.height());

            var margins = {
              left: (parseInt(target.parents(this.item_selector()).css("marginLeft"),10) || 0),
              top: (parseInt(target.parents(this.item_selector()).css("marginTop"),10) || 0)
            };

            mouse.offsetX = (e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left) + margins.left;
            mouse.offsetY = (e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top) + margins.top;
            mouse.startX = mouse.lastX = e.pageX;
            mouse.startY = mouse.lastY = e.pageY;

            this.dragRootEl = this.el;

            this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
            this.dragEl.css('width', dragItem.width());

            dragItem.find('.dd-last-position').remove();
            var orig_place = $('<div class="dd-last-position ' + this.options.itemClass + '" style="display:none;"></div>');
            orig_place.css({ 'height': dragItem.height(), 'margin-top': margins.top, 'margin-left': margins.left });
            dragItem.before(orig_place);

            if (this.options.clone || dragItem.attr('data-clone')) {
              dragItem = dragItem.clone();
            } else {
              dragItem.after(this.placeEl);
              dragItem[0].parentNode.removeChild(dragItem[0]);
            }
            dragItem.appendTo(this.dragEl);

            $(document.body).append(this.dragEl);
            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });
            // total depth of dragging item
            var i, depth, attr_depth, max_depth, min_depth,
                items = this.dragEl.find(this.item_selector(true));
            for (i = 0; i < items.length; i++) {
                depth = $(items[i]).parents(this.parent_list_selector(true)).length;
                attr_depth = items[i].getAttribute('max-depth');

                if (attr_depth && (!max_depth || max_depth > attr_depth - depth)) {
                  max_depth = attr_depth - depth;
                }

                attr_depth = items[i].getAttribute('min-depth');
                if (attr_depth && (!min_depth || min_depth < attr_depth - depth)) {
                  min_depth = attr_depth - depth;
                }
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }

            if (max_depth || max_depth == 0) { this.dragEl.attr('max-depth', max_depth); }
            if (min_depth || min_depth == 0) { this.dragEl.attr('min-depth', min_depth); }

            this.moving = true;
        },

        dragStop: function(e)
        {
            var el = this.dragEl.children(this.item_selector(true)).first();

            this.moving = false;

            var ps, margins;
            var orig_place = this.hasNewRoot ? this.el.find('.dd-last-position') : this.dragRootEl.find('.dd-last-position');
            if ((this.options.clone || el.attr('data-clone')) && (!this.placeEl || this.placeEl.parent().length == 0)) {
              orig_place.show();
              ps = orig_place.offset();
              margins = {
                left: (parseInt(orig_place.css("marginLeft"),10) || 0),
                top: (parseInt(orig_place.css("marginTop"),10) || 0)
              };
              orig_place.hide();
            } else {
              ps = this.placeEl.offset();
              margins = {
                left: (parseInt(this.placeEl.css("marginLeft"),10) || 0),
                top: (parseInt(this.placeEl.css("marginTop"),10) || 0)
              };
            }

            this.dragEl.animate({ left: (ps.left - margins.left).toString() + 'px', top: (ps.top - margins.top).toString() + 'px' }, 500, 'swing', $.proxy(function() {
              var prev_parent = orig_place.parents('.' + this.options.itemClass + ':first');

              orig_place.remove();
              el[0].parentNode.removeChild(el[0]);
              el.removeAttr('style');
              this.placeEl.replaceWith(el);
              this.dragEl.remove( );
              var depth = el.parents(this.parent_list_selector(true)).length;
              this.el.trigger('change', [el, this.el, this.hasNewRoot ? this.dragRootEl : this.el, depth, prev_parent]);
              if (this.hasNewRoot) {
                this.dragRootEl.trigger('change', [el, this.el, this.dragRootEl, depth, prev_parent]);
              }
              this.reset();
            }, this));
        },

        dragMove: function(e)
        {
            var list, parent, prev, next, depth,
                opt   = this.options,
                mouse = this.mouse;

            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX,
                'top'  : e.pageY - mouse.offsetY
            });

            // mouse position last events
            mouse.lastX = mouse.nowX;
            mouse.lastY = mouse.nowY;
            // mouse position this events
            mouse.nowX  = e.pageX;
            mouse.nowY  = e.pageY;
            // distance mouse moved between events
            mouse.distX = mouse.nowX - mouse.lastX;
            mouse.distY = mouse.nowY - mouse.lastY;
            // direction mouse was moving
            mouse.lastDirX = mouse.dirX;
            mouse.lastDirY = mouse.dirY;
            // direction mouse is now moving (on both axis)
            mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
            mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
            // axis mouse is now moving on
            var newAx   = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

            // do nothing on first move
            if (!mouse.moving) {
                mouse.dirAx  = newAx;
                mouse.moving = true;
                return;
            }

            // calc distance moved on this axis (and direction)
            if (mouse.dirAx !== newAx) {
                mouse.distAxX = 0;
                mouse.distAxY = 0;
            } else {
                mouse.distAxX += Math.abs(mouse.distX);
                if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
                    mouse.distAxX = 0;
                }
                mouse.distAxY += Math.abs(mouse.distY);
                if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
                    mouse.distAxY = 0;
                }
            }
            mouse.dirAx = newAx;

            var isEmpty = false;

            // find list item under cursor
            if (!hasPointerEvents) {
              this.dragEl[0].style.visibility = 'hidden';
            }
            this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
            if (!hasPointerEvents) {
              this.dragEl[0].style.visibility = 'visible';
            }
            if (this.pointEl.hasClass(opt.handleClass) || this.pointEl.hasClass(this.options.contentClass) || this.pointEl.hasClass(this.options.itemClass)) {
              this.pointEl = this.pointEl.parents(this.item_selector());
            }

            // find parent list of item under cursor
            var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
                isNewRoot   = this.dragRootEl[0] !== pointElRoot[0],
                skipPlacing = false,
                clonned = false;

            if (!pointElRoot.data('nestable-can-sort-in') && pointElRoot.find('.dd-last-position').length == 0) { skipPlacing = true; }
            var el = this.dragEl.children(this.item_selector(true)).first();
            if (!pointElRoot.data('nestable-can-sort-in') && (this.options.clone || el.attr('data-clone')) && !skipPlacing && this.pointEl.length && this.pointEl.hasClass(opt.itemClass)) {
              parent = this.placeEl.parent();
              this.placeEl.remove();
              if (!parent.children().length) {
                this.unsetParent(parent.parent());
              }
              skipPlacing = true;
              clonned = true;
            }
            if (this.dragEl.attr('no-reroot') && isNewRoot) { return; }

            /**
             * move horizontal
             */
            if (mouse.dirAx && mouse.distAxX >= opt.threshold && !skipPlacing) {
                // reset move distance on x-axis for new phase
                mouse.distAxX = 0;
                prev = this.placeEl.prevAll(this.item_selector());
                // increase horizontal level if previous sibling exists and is not collapsed
                if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
                    // cannot increase level when item above is collapsed
                    list = prev.find(this.parent_list_selector(true)).last();
                    // check if depth limit has reached
                    depth = this.placeEl.parents(this.parent_list_selector(true)).length;

                    if (!this.dragEl.attr('min-depth') || depth >= this.dragEl.attr('min-depth')) {
                        if ((this.dragEl.attr('max-depth') && depth <= this.dragEl.attr('max-depth')) || (!this.dragEl.attr('max-depth') && depth + this.dragDepth <= this.placeEl.parents('.dd:first').data('nestable-max-depth'))) {
                            // create new sub-level if one doesn't exist
                            if (!list.length) {
                                list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                                list.append(this.placeEl);
                                prev.append(list);
                                this.setParent(prev);
                            } else {
                                // else append to next level up
                                list = prev.children(this.parent_list_selector(true)).last();
                                list.append(this.placeEl);
                            }
                        }
                    }
                }
                // decrease horizontal level
                if (mouse.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    next = this.placeEl.nextAll(this.item_selector());
                    if (!next.length) {
                        parent = this.placeEl.parent();
                        depth = this.placeEl.parents(this.parent_list_selector(true)).length - 1;
                        if (!this.dragEl.attr('min-depth') || depth > this.dragEl.attr('min-depth')) {
                          this.placeEl.closest(this.item_selector(true)).after(this.placeEl);
                          if (!parent.children().length) {
                            this.unsetParent(parent.parent());
                          }
                        }
                    }
                }
            }

            if (this.pointEl.hasClass(opt.emptyClass)) {
              isEmpty = true;
            }
            else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
              return;
            }


            /**
             * move vertical
             */
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                // check if groups match if dragging over new root
                if (isNewRoot && opt.group !== pointElRoot.data('nestable-group')) {
                    return;
                }
                // check depth limit
                depth = this.dragDepth - 1 + this.pointEl.parents(this.parent_list_selector(true)).length;
                if (this.dragEl.attr('min-depth') && depth - this.dragDepth + 1 < this.dragEl.attr('min-depth')) {
                    return;
                }
                if ((this.dragEl.attr('max-depth') && depth - this.dragDepth > this.dragEl.attr('max-depth')) || (!this.dragEl.attr('max-depth') && depth > pointElRoot.data('nestable-max-depth'))) {
                    return;
                }
                var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
                parent = this.placeEl.parent();

                if (this.dragEl.attr('min-depth') && depth - this.dragDepth < this.dragEl.attr('min-depth') && !skipPlacing) {
                  if (isEmpty) {
                    return;
                  }
                  if ((this.dragEl.attr('max-depth') && depth - this.dragDepth + 1 > this.dragEl.attr('max-depth')) || (!this.dragEl.attr('max-depth') && depth + 1 > pointElRoot.data('nestable-max-depth'))) {
                    return;
                  }

                  list = this.pointEl.find(this.parent_list_selector(true)).last();
                  if (list.length == 0) {
                    list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                    list.append(this.placeEl);
                    this.pointEl.append(list);
                    this.setParent(this.pointEl);
                  }
                } else {
                  // if empty create new list to replace empty placeholder
                  if (isEmpty) {
                    list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
                    list.append(this.placeEl);
                    this.pointEl.replaceWith(list);
                  }
                  else if (!pointElRoot.data('nestable-can-sort-in') && !skipPlacing) {
                    pointElRoot.find('.dd-last-position').before(this.placeEl);
                  }
                  else if (before && !skipPlacing) {
                    this.pointEl.before(this.placeEl);
                  }
                  else if (!skipPlacing) {
                    this.pointEl.after(this.placeEl);
                  }
                }


                if (!this.dragRootEl.find(this.item_selector(true)).length && (!skipPlacing || clonned)) {
                  this.dragRootEl.find('.' + opt.listClass).remove();
                  this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
                }
                if (!parent.children().length) {
                  this.unsetParent(parent.parent());
                }
                // parent root list has changed
                if (isNewRoot) {
                    this.dragRootEl = pointElRoot;
                    this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
                }
            }
        }
    };

    $.fn.nestable = function(params)
    {
        var lists  = this,
            retval = this;

        lists.each(function()
        {
            var plugin = $(this).data("nestable");

            if (!plugin) {
                $(this).data("nestable", new Plugin(this, params));
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };

})(window.jQuery || window.Zepto, window, document);
