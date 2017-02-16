module Usability
  module IssuePatch
    def self.included(base)
      base.send :include, InstanceMethods

      base.class_eval do
        alias_method_chain :save_attachments, :usability
      end
    end

    module InstanceMethods
      def save_attachments_with_usability(attachments, author=User.current)
        res = save_attachments_without_usability(attachments, author)

        return res unless Setting.plugin_usability['join_attachments_to_group']
        return res unless res.is_a?(Hash)

        group_id = 1

        unless self.new_record?
          group_id = Attachment.where(container_id: self.id, container_type: 'Issue').maximum(:us_group_id).to_i + 1
        end

        @saved_attachments = @saved_attachments.map { |it| it.us_group_id = group_id || 1; it }
        @unsaved_attachments = @unsaved_attachments.map { |it| it.us_group_id = group_id || 1; it }

        { files: saved_attachments, unsaved: unsaved_attachments }
      end
    end
  end
end