class CmItemCustom < CmItem

  validates :caption, presence: true

  def item_text(view, opts, *args)
    cl = opts.delete(:class)
    opts = (self.options || {}).merge(opts)
    opts[:class] = opts[:class].to_s + ' ' + cl if cl.present?

    self.custom_url ? view.link_to("<span>#{self.caption}</span>".html_safe, Redmine::Utils.relative_url_root + self.custom_url, opts) : "<span>#{self.caption}</span>".html_safe
  end

  def self.item_label(code)
    ''
  end

  def item_label
    self.caption
  end

  def can_edit?
    User.current.admin?
  end

  def visible?(project=nil, from_parent=false)
    return false unless (!self.logged || User.current.logged?) && (self.visibility != CmItem::VISIBILITY_ADMIN || User.current.admin?)

    super(project, from_parent)
  end
end