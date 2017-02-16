module Usability
  module NewsPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        safe_attributes 'uncommentable'
        alias_method_chain :commentable?, :usability
      end
    end

    module InstanceMethods
      def commentable_with_usability?(user=User.current)
        if self.uncommentable
          false
        else
          user.allowed_to?(:comment_news, project)
        end
      end
    end

  end
end