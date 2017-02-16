module Usability
  module UsersControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      # Same as typing in the class
      base.class_eval do
        if Redmine::Plugin.installed?(:ldap_users_sync)
          before_filter :change_activity_options, only: [:show, :show_user_details, :ld_user_details]
        else
          before_filter :change_activity_options, only: [:show, :show_user_details]
        end

        skip_before_filter :require_admin, only: [:show_user_details]
      end

    end

    module InstanceMethods

      def show_user_details
        @user = User.find(params[:id])
        @memberships = @user.memberships.where(Project.visible_condition(User.current))

        events = Redmine::Activity::Fetcher.new(User.current, author: @user).events(nil, nil, limit: 10)
        @events_by_day = events.group_by(&:event_date)

        unless User.current.admin?
          if !@user.active? || (@user != User.current  && @memberships.empty? && events.empty?)
            render_404
            return
          end
        end

        @tabs = [ {name: 'details', partial: 'details_common', label: :label_user_details_contacts},
                  {name: 'actions', partial: 'details_actions', label: :label_user_details_actions} ]
        render 'show_user_details', layout: 'compact'
      end

      private

      def change_activity_options
        if Redmine::VERSION.to_s >= '3.0.0'
          if Journal.activity_provider_options['issues'].present? && Journal.activity_provider_options['issues'].has_key?(:scope)
            if Setting.plugin_usability['enable_full_activities_for_issues']
              Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue'")
              Journal.event_options[:type] = Proc.new { |o| o.notes.blank? ? ((s = o.new_status).present? && s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
            else
              Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue' AND (#{JournalDetail.table_name}.prop_key = 'status_id' OR #{Journal.table_name}.notes <> '')")
              Journal.event_options[:type] = Proc.new { |o| (s = o.new_status) ? (s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
            end
          end
        else
          if Journal.activity_provider_options['issues'].present? && Journal.activity_provider_options['issues'][:find_options].present?
            if Setting.plugin_usability['enable_full_activities_for_issues']
              Journal.activity_provider_options['issues'][:find_options][:conditions] = "#{Journal.table_name}.journalized_type = 'Issue'"
              Journal.event_options[:type] = Proc.new { |o| o.notes.blank? ? ((s = o.new_status).present? && s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
            else
              Journal.activity_provider_options['issues'][:find_options][:conditions] = "#{Journal.table_name}.journalized_type = 'Issue' AND (#{JournalDetail.table_name}.prop_key = 'status_id' OR #{Journal.table_name}.notes <> '')"
              Journal.event_options[:type] = Proc.new { |o| (s = o.new_status) ? (s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
            end
          end
        end
      end

    end
  end
end
