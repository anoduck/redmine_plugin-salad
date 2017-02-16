module Usability
  module IssuesControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        alias_method_chain :new, :usability
        alias_method_chain :create, :usability
        alias_method_chain :retrieve_previous_and_next_issue_ids, :usability

        before_filter :us_set_flag, only: [:update, :show, :destroy]
      end
    end


    module InstanceMethods
      def new_with_usability
        if session[:us_store].present?
          us_store = @issue.custom_field_values.inject({}) { |res, vl| res[vl.custom_field_id] = session[:us_store][vl.custom_field_id] if vl.custom_field.us_store_for_new.to_s == '1' && session[:us_store][vl.custom_field_id].present?; res }
          @issue.custom_field_values = us_store
        end
        if @project && @issue && params[:easy_perplex]
          if Redmine::Plugin.installed?(:clear_plan) && !Setting.plugin_clear_plan[:cf_executor_id].blank?
            @issue.executor_id = params[:executor_id]
            @issue.custom_field_values = { Setting.plugin_clear_plan[:cf_executor_id].to_s => params[:executor_id] }
          end

          @issue.start_date = User.current.today
          if Setting.plugin_usability[:easy_perplex_cf_customer_id] && User.member_of(@project).exists?(["#{User.table_name}.id = ?", User.current.id])
            @issue.custom_field_values = { Setting.plugin_usability[:easy_perplex_cf_customer_id].to_s => User.current.id }
          end
        end

        new_without_usability
      end

      def create_with_usability
        session[:us_store] ||= {}
        us_store = @issue.custom_field_values.inject({}) { |res, vl| res[vl.custom_field_id] = vl.value if vl.custom_field.us_store_for_new.to_s == '1' && vl.value != vl.value_was; res }
        session[:us_store] = session[:us_store].merge(us_store)

        create_without_usability
      end

      def retrieve_previous_and_next_issue_ids_with_usability
        unless Setting.plugin_usability['hide_next_prev_issues']
          retrieve_previous_and_next_issue_ids_without_usability
        end
      end

      def us_set_flag
        @use_static_date_in_history = Setting.plugin_usability['use_static_date_in_history']
      end
    end
  end
end