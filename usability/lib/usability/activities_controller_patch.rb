module Usability
  module ActivitiesControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        alias_method_chain :index, :usability
      end
    end

    module InstanceMethods
      def index_with_usability
        if Redmine::VERSION.to_s >= '3.0.0'
          if Journal.activity_provider_options['issues'].present? && Journal.activity_provider_options['issues'][:scope].is_a?(ActiveRecord::Relation)
            if Setting.plugin_usability['enable_full_activities_for_issues']
              Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue'").uniq
              Journal.event_options[:type] = Proc.new { |o| o.notes.blank? ? ((s = o.new_status).present? && s.is_closed? ? 'issue-closed' : 'issue-edit') : 'issue-note' }
            else
              Journal.activity_provider_options['issues'][:scope] = Journal.preload({ issue: :project }, :user).joins("LEFT OUTER JOIN #{JournalDetail.table_name} ON #{JournalDetail.table_name}.journal_id = #{Journal.table_name}.id").where("#{Journal.table_name}.journalized_type = 'Issue' AND (#{JournalDetail.table_name}.prop_key = 'status_id' OR #{Journal.table_name}.notes <> '')").uniq
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
        index_without_usability
      end
    end
  end
end