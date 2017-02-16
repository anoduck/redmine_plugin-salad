module CustomMenu
  module ApplicationHelperPatch
    def self.included(base)
      base.send :include, InstanceMethods

      base.class_eval do
        alias_method_chain :javascript_include_tag, :custom_menu
        alias_method_chain :render_project_jump_box, :custom_menu
      end
    end

    module InstanceMethods

      def render_project_jump_box_with_custom_menu
        unless acl_mobile_device?
          render_project_jump_box_without_custom_menu
        end
      end

      def javascript_include_tag_with_custom_menu(*sources)
        return javascript_include_tag_without_custom_menu(*sources) if !(Setting.plugin_custom_menu || {})['use_custom_menu'] || (sources.last.is_a?(Hash) && sources.last[:plugin].present?)

        sources = sources - ['responsive', :responsive, 'responsive.js']
        javascript_include_tag_without_custom_menu(*sources)
      end
    end
  end
end