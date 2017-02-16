class CmItemPlugin < CmItem
  validate :validate_all_other

  extend Redmine::MenuManager::MenuHelper

  def self.menu_items
    return @menu_items if @menu_items.present?
    @menu_items = {}
    @menu_items = (Redmine::MenuManager.items(:top_menu).try(:root).try(:children) || []).inject({}) { |res, it| res['top_menu_' + it.name.to_s] = it; res }
    @menu_items = @menu_items.merge((Redmine::MenuManager.items(:account_menu).try(:root).try(:children) || []).inject({}) { |res, it| res['account_menu_' + it.name.to_s] = it; res })
    @menu_items = @menu_items.merge((Redmine::MenuManager.items(:custom_menu).try(:root).try(:children) || []).inject({}) { |res, it| res['custom_menu_' + it.name.to_s] = it; res })

    return @menu_items
  end

  def available_items
    return @available_items if @available_items.present?
    return @available_items = { self.code => self.class.menu_items[self.code.to_s] } unless self.new_record?

    used_items = CmItemPlugin.select(:code).uniq.map(&:code)
    return @available_items = self.class.menu_items.except(*used_items)
  end

  def self.item_text(view, item, opts={}, project=nil)
    return nil if item.blank?

    cl = opts.delete(:class)
    opts = item.html_options.merge(opts)
    opts[:class] = opts[:class].to_s + ' ' + cl if cl.present?

    caption, url, selected = view.extract_node_details(item, project)
    return (url ? view.link_to(caption, url, opts) : caption).html_safe
  end

  # maybe need the view context, but not now
  def self.visible?(item, project=nil)
    item.present? && (item.cm_skip_blank_checking = true) && allowed_node?(item, User.current, project)
  end

  def item
    @item ||= self.available_items[self.code.to_s]
  end

  def item_text(view, opts={}, project=nil)
    self.class.item_text(view, self.item, opts, project)
  end

  def self.item_label(code)
    l("label_cm_menu_#{code}", default: code.humanize)
  end

  def item_label
    self.class.item_label(self.code)
  end

  def visible?(project=nil, from_parent=false)
    self.item && self.class.visible?(self.item) && super(project, from_parent)
  end

  private

  def validate_all_other
    if self.code.blank?
      self.errors.add(:code, :blank)
    elsif self.item.blank?
      self.errors.add(:code, :invalid)
    end
  end
end