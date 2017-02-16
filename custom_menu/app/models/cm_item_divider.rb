class CmItemDivider < CmItem
  def self.ui_order
    0
  end

  def available_items
    { 'custom_menu_cm_menu_divider' => Redmine::MenuManager::MenuItem.new('cm_menu_divider', nil, { caption: self.item_text }) }
  end

  def self.item_text(*args)
    '<hr class="cm-menu-divider">'.html_safe
  end

  def self.item_label(code)
    self.item_text
  end

  def item_label
    self.item_text
  end

  def item_text(*args)
    self.class.item_text
  end

  def self.multiple?
    true
  end
  def visible?(project=nil, from_parent=false)
    true
  end
end