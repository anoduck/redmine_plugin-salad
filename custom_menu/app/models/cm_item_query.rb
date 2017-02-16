class CmItemQuery < CmItem
  validates :caption, presence: true
  validates :query_id, presence: true

  belongs_to :issue_query, foreign_key: :query_id

  def item_text(view, opts, *args)
    cl = opts.delete(:class)
    opts = (self.options || {}).merge(opts)
    opts[:class] = opts[:class].to_s + ' ' + cl if cl.present?

    span = "<span>#{self.caption}</span>".html_safe

    if self.issue_query

      if Redmine::Plugin.installed?(:ajax_counters) && Redmine::Plugin.installed?(:extra_queries) && self.issue_query.try(:eq_counter)
        span << User.current.ajax_counter(Redmine::Utils.relative_url_root.to_s + "/extra_queries/eq_count/#{self.query_id.to_s}", {period: 300, css: 'count ac_light'}).html_safe
      end

      view.link_to(span,
                   {controller: 'issues',
                    action: 'index',
                    project_id: self.issue_query.project_id,
                    query_id: self.query_id}, opts)
    else
      span
    end
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
    self.issue_query.present? && self.issue_query.visible?(User.current) && super(project, from_parent)
  end

end