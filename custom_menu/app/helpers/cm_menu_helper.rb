module CmMenuHelper
  def render_custom_menu_for_admin(menu_items, project=nil)
    return nil if menu_items.blank?
    chain = []


    html = '<ul class="dd-list">'

    menu_items.each do |it|
      while chain.size > 0 && !it.is_descendant_of?(chain.last)
        html << '</ul></li>'
        chain.pop
      end

      html << '<li class="dd-item" data-type="' + it.class.name + '" data-id="nst-' + it.id.to_s + '"'
      if it.code.present?
        html << ' data-code="' + it.code + '"'
      else
        html += ' data-caption="' + it.caption.to_s + '"'
        html += ' data-custom_url="' + it.custom_url.to_s + '"' if it.custom_url.present?
        html += ' data-options_class="' + (it.options || {})[:class].to_s + '"' if it.options.present?
        html += ' data-logged="' + (it.logged ? 'true' : 'false') + '"' if it.logged.present?
        html += ' data-visibility="' + it.visibility.to_s + '"' if it.visibility.present?
        html += ' data-roles="' + it.cm_roles.map(&:role_id).join(',') + '"' if it.cm_roles.present?
        html += ' data-item-query="' + it.query_id.to_s + '"' if it.query_id.present?
      end
      html << '>'
      html << render_menu_item_content(it, project)

      if it.rgt - it.lft != 1
        html << '<ul class="dd-list">'
        chain << it
      else
        html << '</li>'
      end
    end

    html << '</ul></li>' * chain.size
    html << '</ul>'
    html.html_safe
  end

  def render_menu_item_content(item, project=nil)
    html = ''
    html << '<div class="dd-content dd-buttunable">'
    html << '<div class="dd-handle"></div>'

    item_label = item.item_label
    if item_label.blank?
      html << l(:label_cm_not_available)
    else
      html << item_label
    end

    html << '<div class="dd-right">'
    html << link_to('', '#', class: 'icon icon-edit cm-edit link_to_modal') if item.can_edit?
    html << link_to('', '#', class: 'icon icon-del cm-del') if item.rgt - item.lft == 1
    html << '</div>'

    html << '</div>'
    html.html_safe
  end

  def options_for_cm_item_query_id
    queries = IssueQuery.preload(:project)
                  .where('visibility = ? or visibility = ?', Query::VISIBILITY_ROLES, Query::VISIBILITY_PUBLIC)
                  .order('case when project_id is NULL then 0 else project_id end')
    options = ''
    return if queries.blank?
    last_group = ''
    queries.each do |q|
      #TODO need refactor
      next if q.project_id.present? && q.project.nil?
      if last_group != q.project_id
        options << '</optgroup>' if last_group != ''
        last_group == '' && q.project.nil? ? (options << "<optgroup label=\"#{l(:field_is_for_all)}\">") : (options << "<optgroup label=\"#{q.project.name}\">")
      end
      options << "<option value=\"#{q.id}\">#{q.name}</option>"
      last_group = q.project_id
    end
    options << '</optgroup>'
    options.html_safe
  end

end