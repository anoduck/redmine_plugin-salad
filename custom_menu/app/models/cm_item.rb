class CmItem < ActiveRecord::Base
  include Redmine::SubclassFactory

  has_many :cm_roles, class_name: 'CmRole', foreign_key: :item_id, dependent: :delete_all
  has_many :roles, through: :cm_roles

  serialize :options
  acts_as_nested_set

  scope :sorted, -> { order("#{CmItem.table_name}.lft") }

  validates :menu, presence: true
  validates :menu, inclusion: %w(top_menu account_menu)

  attr_protected :id

  scope :visible, lambda { |project|
    project_id = (project.try(:id) || project).to_i

    if User.current.admin?
      where('1=1')
    elsif Redmine::Plugin.installed?(:global_roles)
      where("#{CmItem.table_name}.visibility = ?
             OR (
                  #{CmItem.table_name}.visibility = ?
                  AND
                  #{CmItem.table_name}.id IN (
                                               SELECT DISTINCT t.id
                                               FROM #{CmItem.table_name} t
                                                    INNER JOIN #{CmRole.table_name} r on r.item_id = t.id
                                                    LEFT JOIN #{GlobalRole.table_name} gr on gr.role_id = r.role_id and gr.user_id in (?)
                                                    LEFT JOIN #{MemberRole.table_name} mr ON mr.role_id = r.role_id
                                                    LEFT JOIN #{Member.table_name} m ON m.id = mr.member_id AND m.user_id = ? and (m.project_id = ? OR ? = 0)
                                               WHERE gr.id is not null or m.id is not null
                                             )
                )
             OR (#{CmItem.table_name}.visibility = ? AND ? = ?)
            ", VISIBILITY_PUBLIC, VISIBILITY_ROLE, [User.current.id] + User.current.groups.map(&:id), User.current.id, project_id, project_id, VISIBILITY_ADMIN, User.current.admin?, true)
    else
      where("#{CmItem.table_name}.visibility = ?
             OR (
                  #{CmItem.table_name}.visibility = ?
                  AND
                  #{CmItem.table_name}.id IN (
                                               SELECT DISTINCT t.id
                                               FROM #{CmItem.table_name} t
                                                    INNER JOIN #{CmRole.table_name} r on r.item_id = t.id
                                                    LEFT JOIN #{MemberRole.table_name} mr ON mr.role_id = r.role_id
                                                    LEFT JOIN #{Member.table_name} m ON m.id = mr.member_id AND m.user_id = ? and (m.project_id = ? OR ? = 0)
                                               WHERE m.id is not null
                                             )
                )
             OR (#{CmItem.table_name}.visibility = ? AND ? = ?)
            ", VISIBILITY_PUBLIC, VISIBILITY_ROLE, User.current.id, project_id, project_id, VISIBILITY_ADMIN, User.current.admin?, true)
    end
  }

  VISIBILITY_PUBLIC = 0
  VISIBILITY_ROLE = 1
  VISIBILITY_ADMIN = 2

  def self.human_attribute_name(attr, *args)
    attr = attr.to_s.sub(/_id$/, '')

    l("field_cm_item_#{attr}", default: ["field_#{attr}".to_sym, attr])
  end

  def self.ui_order
    9999
  end

  def self.item_text(view, item, opts={}, project=nil)
    nil
  end

  def item_text(view, opts, *args)
    nil
  end

  def self.item_label(code)
    ''
  end

  def item_label
    ''
  end

  def visible?(project, from_parent=false)
    return true if from_parent && self.leaf?
    if self.leaf?
      self.parent.blank? || self.parent.visible?(project)
    else
      self.children.detect { |it| it.visible?(project, true) }.present?
    end
  end

  def can_edit?
    false
  end

  def self.multiple?
    false
  end

  def available_items
    {}
  end


  def self.available_items
    self.descendants.sort_by(&:ui_order).inject({}) { |res, cl| ai = cl.new.available_items; ai.present? && (res[cl] = ai); res }
  end

  def self.cm_search(options={})
    html = '<div id="cm-search-box"></div>'
    html << '<script>
               $(document).ready(function () {


                 // places search field in the top menu to the left of username button
                 $("#q").attr("placeholder", $("label[for=q] a").text());
                 $("label[for=q]").remove();
                 $("#quick-search").appendTo("#cm-search-box");


                 // expands search field on gaining focus if possible
                 $("#q").focus(function(index) {
                   RMPlus.Menu.expand_q_if_possible();
                 });

                 $("#q").blur(function(index) {
                   if (typeof $("#q").data("last_width") != "undefined") {
                     $(this).animate({ width: $("#q").data("last_width") }, 300, "swing", RMPlus.Menu.rebuild_menu);
                   }
                 });
               });
            </script>'
    html.html_safe
  end

  def self.cm_my_activity
    ('<a href="' + Redmine::Utils.relative_url_root + '/activity?user_id='+User.current.id.to_s+'" class="no_line"><span>' + I18n.t(:label_activity) + '</span></a>').html_safe
  end

  def self.redner_menu_projects_tree
    projects = User.current.projects.active
    html = ''
    app_help = Class.new.extend(ApplicationHelper)

    if projects[0]
      html << '<div class="title">' + I18n.t(:cm_go_to_project_issues).to_s + '</div>'
      html << '<div class="cm-projects-tree">'
      app_help.project_tree(projects) do |project, level|
        html << '<a href="' + Redmine::Utils.relative_url_root + '/projects/' + project.identifier.to_s + '/issues" class="no-select no_line"><span style="margin-left: ' + (level*20).to_s + 'px;">' + project.name + '</span></a>'
      end
      html << '</div>'
    else
      html << '<div class="no-projects-membership" style="display:none;"></div>'
    end
    html.html_safe
  end

  def destroy(*args)
    self.move_childs_to_my_parent
    super(*args)
  end

  def move_childs_to_my_parent
    if self.rgt - self.lft != 1
      # self.errors.add(:base, l(:error_cm_cannot_delete_with_childs))
      # return false
      self.children.each do |ch|
        ch.parent_id = self.parent_id
        ch.save
      end
    end
  end

  private

  def validate_destroy
    if self.rgt - self.lft != 1
      self.errors.add(:base, l(:error_cm_cannot_delete_with_childs))
      return false
    end
  end
end

require_dependency 'cm_item_divider'
require_dependency 'cm_item_plugin'