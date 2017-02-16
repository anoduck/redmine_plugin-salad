module Usability
  module WelcomeControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

    # Same as typing in the class
      base.class_eval do
        alias_method_chain :index, :usability
      end

    end

    module InstanceMethods
      # Methods to add to specific issue objects
      def index_with_usability
        if Setting.plugin_usability['enable_custom_default_page']
          def_page = Setting.plugin_usability['default_page']
          if def_page.nil? || def_page == ''
            redirect_to url_for(controller: 'my', action: 'page')
          else
            redirect_to def_page
          end
          return
        end
        index_without_usability
      end

    end
  end
end

