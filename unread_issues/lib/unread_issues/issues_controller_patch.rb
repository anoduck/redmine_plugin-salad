module UnreadIssues
  module IssuesControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        after_filter :make_issue_read, only: [:show]
      end
    end

    module InstanceMethods

      def make_issue_read
        @issue.ui_make_issue_read
      end
    end
  end
end
