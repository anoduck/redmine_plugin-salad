Redmine::Plugin.register :unread_issues do
  name 'Unread Issues plugin'
  author 'Vladimir Pitin, Danil Kukhlevskiy, Kovalevsky Vasil'
  description 'This is a plugin for Redmine, that marks unread issues'
    version '2.1.0'
    url 'http://rmplus.pro/redmine/plugins/unread_issues'
    author_url 'http://rmplus.pro'

  settings partial: 'unread_issues/settings',
           default: { 'assigned_issues' => '', }

  project_module :issue_tracking do
    permission :view_issue_view_stats, issue_view_stats: [:view_stats]
  end

  if Redmine::Plugin.installed?(:magic_my_page)
    delete_menu_item :top_menu, :my_page
    menu :top_menu, :my_page, { controller: 'my', action: 'page' }, caption: Proc.new { User.current.my_page_caption },  if: Proc.new { User.current.logged? }, first: true
  end
  menu :top_menu, :us_my_issues, :us_my_issues_url, caption: Proc.new { User.current.my_issues_caption }, if: Proc.new { User.current.logged? }, first: true
end

Rails.application.config.to_prepare do
  Issue.send(:include, UnreadIssues::IssuePatch)
  User.send(:include, UnreadIssues::UserPatch)
  IssuesController.send(:include, UnreadIssues::IssuesControllerPatch)
  IssueQuery.send(:include, UnreadIssues::IssueQueryPatch)
  QueriesController.send(:include, UnreadIssues::QueriesControllerPatch)
  ActionView::Base.send(:include, UsMenuHelper)
end

require 'unread_issues/hooks_views'