require 'custom_menu/awesome_nested_set_patch'


Redmine::Plugin.register :custom_menu do
  name 'Custom Menu Redmine'
  author 'Kovalevskiy Vasil, Danil Kukhlevskiy'
  description 'This is a plugin for Redmine changable top menu'
  version '1.7.2'
  url 'http://rmplus.pro/redmine/plugins/custom_menu'
  author_url 'http://rmplus.pro/'

  settings partial: 'settings/custom_menu',
           default: {}

  menu :custom_menu, :cm_all_projects, {controller: 'projects', action: 'index'}, caption: :cm_all_projects, if: Proc.new { User.current.logged? }, html: {class: 'no_line'}
  menu :custom_menu, :my_name, '#', caption: Proc.new { ('<span>' + User.current.name + '</span>').html_safe }, if: Proc.new { User.current.logged? }, html: {class: 'in_link'}
  menu :custom_menu, :cm_search, nil, caption: Proc.new { CmItem.cm_search }, if: Proc.new { true }
  menu :custom_menu, :cm_project_tree, nil, caption: Proc.new { CmItem.redner_menu_projects_tree }, if: Proc.new { User.current.logged? }
  menu :custom_menu, :cm_my_activity, nil, caption: Proc.new { CmItem.cm_my_activity }, if: Proc.new { User.current.logged? }


  menu :admin_menu, :cm_menu, { controller: 'cm_menu', action: 'index' }, caption: :label_cm_admin_menu_item
end
Rails.application.config.to_prepare do
  require_dependency 'redmine/menu_manager'

  Redmine::MenuManager::MenuItem.send(:include, ::CustomMenu::MenuItemPatch)
  Redmine::MenuManager::MenuHelper.send(:include, ::CustomMenu::MenuHelperPatch)

  if Redmine::VERSION.to_s >= '3.2.0'
    ApplicationHelper.send :include, CustomMenu::ApplicationHelperPatch
  end
end

Rails.application.config.after_initialize do
  plugins = { a_common_libs: '2.1.9' }
  plugin = Redmine::Plugin.find(:custom_menu)
  plugins.each do |k,v|
    begin
      plugin.requires_redmine_plugin(k, v)
    rescue Redmine::PluginNotFound => ex
      raise(Redmine::PluginNotFound, "Plugin requires #{k} not found")
    end
  end
end

require 'custom_menu/view_hooks'