module UnreadIssues
  module UserPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        cattr_accessor :ir_query
        has_many :issue_reads, dependent: :delete_all
        has_many :assigned_issues, class_name: 'Issue' , foreign_key: 'assigned_to_id'
      end
    end

    module InstanceMethods
      def my_page_caption
        s = "<span class='my_page'>#{l(:my_issues_on_my_page)}</span> "
        if Redmine::Plugin.installed?(:magic_my_page)
          s << "<span id='my_page_issues_count'>#{my_page_counts}</span>"
        end
        s.html_safe
      end

      def my_issues_caption
        s = "<span class='my_page'>#{l(:label_us_my_issues)}</span>"
        s << "<span id='my_page_issues_count'>#{my_page_counts}</span>"
        s.html_safe
      end

      def my_page_counts
        s=''
        if Redmine::Plugin::registered_plugins.include?(:ajax_counters)
          s = self.ajax_counter(Redmine::Utils.relative_url_root.to_s + '/issue_reads/count/assigned', {period: 0, css: 'count'})
          s << self.ajax_counter(Redmine::Utils.relative_url_root.to_s + '/issue_reads/count/unread', {period: 0, css: 'count unread'})
          s << self.ajax_counter(Redmine::Utils.relative_url_root.to_s + '/issue_reads/count/updated', {period: 0, css: 'count updated'})
        else
          counts = ui_issues_counts
          s << "<span class=\"count\">#{counts[:assigned]}</span>" if counts[:assigned]>0
          s << "<span class=\"count unread\">#{counts[:unread]}</span>" if counts[:unread]>0
          s << "<span class=\"count updated\">#{counts[:updated]}</span>" if counts[:updated]>0
        end
        s.html_safe
      end

      def ui_issues_counts
        counts = { assigned: 0, unread: 0, updated: 0 }

        unless Setting.plugin_unread_issues.is_a?(Hash)
          Setting.plugin_unread_issues = {}
        end

        if self.class.ir_query.blank? || !self.class.ir_query.is_a?(IssueQuery) || self.class.ir_query.id.to_i != (Setting.plugin_unread_issues || {})[:assigned_issues].to_i
          begin
            self.class.ir_query = IssueQuery.find((Setting.plugin_unread_issues || {})[:assigned_issues].to_i)
            self.class.ir_query.group_by = ''
          rescue ActiveRecord::RecordNotFound
            return counts
          end
        end

        return counts if self.class.ir_query.blank?

        counts[:assigned] = self.class.ir_query.issues.size
        counts[:unread] = self.class.ir_query.issues(conditions: "#{IssueRead.table_name}.read_date is null").size
        counts[:updated] = self.class.ir_query.issues(conditions: "#{IssueRead.table_name}.read_date < #{Issue.table_name}.updated_on").size

        counts
      end
    end
  end
end
