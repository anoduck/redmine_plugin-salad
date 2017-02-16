module CustomMenu
  module CustomMenu
    class Hooks  < Redmine::Hook::ViewListener
      render_on(:view_layouts_base_html_head, partial: 'hooks/custom_menu/html_head')
    end
  end
end
