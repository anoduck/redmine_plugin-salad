module UnreadIssues
  module IssuePatch

    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        if Redmine::VERSION.to_s >= '3.0.0'
          has_many :issue_reads, -> { order("#{IssueRead.table_name}.read_date DESC") }, dependent: :delete_all
          has_one :user_read, -> { where("#{IssueRead.table_name}.user_id = #{User.current.id}") }, class_name: 'IssueRead', foreign_key: 'issue_id'
        else
          has_many :issue_reads, dependent: :delete_all, order: 'read_date DESC'
          has_one :user_read, class_name: 'IssueRead', foreign_key: 'issue_id', conditions: proc {"#{IssueRead.table_name}.user_id = #{User.current.id}"}
        end

        alias_method_chain :css_classes, :unread_issues

        before_save :ui_store_necessary_to_make_issue_read
        after_save :ui_make_issue_reed_if_needed
      end
    end

    module InstanceMethods
      def css_classes_with_unread_issues(user=User.current)
        s = css_classes_without_unread_issues(user)
        s << ' unread' if self.uis_unread
        s << ' updated' if self.uis_updated
        s
      end

      def uis_read_date
        return nil if (self.user_read.nil?)
        self.user_read.read_date
      end

      def uis_unread
        self.user_read.nil?
      end

      def uis_updated(updated=self.updated_on)
        self.user_read && self.user_read.read_date && self.updated_on && self.user_read.read_date < updated
      end

      def ui_make_issue_read
        issue_read = IssueRead.where(user_id: User.current.id, issue_id: self.id).first_or_initialize
        issue_read.read_date = Time.now
        issue_read.save
      end

      private

      def ui_store_necessary_to_make_issue_read
        @ui_necessary_to_make_issue_read = self.new_record? || (!self.uis_unread && !self.uis_updated(self.updated_on_changed? ? self.updated_on_was : self.updated_on))
        true
      end

      def ui_make_issue_reed_if_needed
        return unless @ui_necessary_to_make_issue_read
        self.ui_make_issue_read
      end
    end
  end
end
