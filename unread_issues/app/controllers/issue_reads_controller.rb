class IssueReadsController < ApplicationController
  cattr_accessor :ir_query

  def count
    unless Redmine::Plugin.installed?(:ajax_counters)
      render nothing: true
    end

    if (Setting.plugin_unread_issues || {})[:assigned_issues].to_i == 0
      ajax_counter_respond(0)
      return
    end

    if self.class.ir_query.blank? || !self.class.ir_query.is_a?(IssueQuery) || self.class.ir_query.id.to_i != (Setting.plugin_unread_issues || {})[:assigned_issues].to_i
      begin
        self.class.ir_query = IssueQuery.find((Setting.plugin_unread_issues || {})[:assigned_issues].to_i)
        self.class.ir_query.group_by = ''
      rescue ActiveRecord::RecordNotFound
        ajax_counter_respond(0)
        return
      end
    end

    case params[:req]
      when 'assigned'
        num_issues = self.class.ir_query.issues.size
      when 'unread'
        num_issues = self.class.ir_query.issues(conditions: "#{IssueRead.table_name}.read_date is null").size
      when 'updated'
        num_issues = self.class.ir_query.issues(conditions: "#{IssueRead.table_name}.read_date < #{Issue.table_name}.updated_on").size
      else
        num_issues = 0
    end
    # save counter to prevent extra ajax request

    ajax_counter_respond(num_issues)
  end

  def view_stats
    @issue = Issue.find(params[:id])
    @issue_reads = @issue.issue_reads
  end
end
