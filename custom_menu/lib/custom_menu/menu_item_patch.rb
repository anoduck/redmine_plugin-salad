module CustomMenu
  module MenuItemPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        alias_method_chain :caption, :cm
        alias_method_chain :allowed?, :cm

        attr_accessor :cm_skip_blank_checking
      end
    end

    module InstanceMethods
      def caption_with_cm(project=nil)
        vl = caption_without_cm(project)
        vl = "<span>#{vl}</span>".html_safe if @caption.is_a?(Symbol)
        vl
      end

      def allowed_with_cm?(user, project)
        was_blank = false
        if url.blank? && self.cm_skip_blank_checking
          @url = '#'
          was_blank = true
        end
        res = allowed_without_cm?(user, project)
        self.cm_skip_blank_checking = false
        @url = nil if was_blank

        res
      end
    end
  end
end