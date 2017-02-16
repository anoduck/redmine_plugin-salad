module CustomMenu
  module MenuHelperPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do

        def render_custom_menu(menu, project=nil)
          menu_items = CmItem.preload(:parent).where(menu: menu.to_s).order("#{CmItem.table_name}.lft").visible(project)

          if menu_items.blank? && menu.to_s == 'top_menu'
            menu_items = [CmItemCustom.new(caption: l(:label_administration), custom_url: url_for(controller: :admin, action: :index))] if User.current.admin?
          else
            menu_items = menu_items.select { |it| it.visible?(project) }
          end

          return nil if menu_items.blank?
          chain = []


          html = '<ul class="cm-menu-header">'

          menu_items.each do |it|
            while chain.size > 0 && !it.is_descendant_of?(chain.last)
              html << '</ul></li>'
              chain.pop
            end

            html << '<li'

            opts = {}
            if it.rgt.to_i - it.lft.to_i > 1
              html << ' class="dropdown"'
              opts = { data: { toggle: 'dropdown' }, class: 'dropdown-toggle in_link' }
            end

            html << '>'

            item = it.item_text(self, opts, project).to_s
            if item.blank?
              html << l(:label_cm_not_available)
            else
              html << item
            end



            if it.rgt.to_i - it.lft.to_i > 1
              html << '<ul data-for-item="' + it.id.to_s + '" class="dropdown-menu" role="menu" aria-labelledby="dLabel">'
              chain << it
            else
              html << '<ul></ul>' if chain.size == 0
              html << '</li>'
            end
          end

          html << '</ul></li>' * chain.size
          html << '</ul>'
          html.html_safe
        end

        alias_method_chain :render_menu, :custom_menu
      end
    end

    module InstanceMethods
      def render_menu_with_custom_menu(menu, project=nil)
        settings = Setting.plugin_custom_menu || {}
        if settings[:use_custom_menu] && [:top_menu, :account_menu].include?(menu)

          if settings['use_cache']
            Rails.cache.fetch("custom_menu/#{User.current.id}/#{menu}/#{project.try(:identifier) || 'wholeprojects'}/user_menu", expires_in: 5.minutes) do
              self.render_custom_menu(menu, project)
            end
          else
            self.render_custom_menu(menu, project)
          end
        else
          render_menu_without_custom_menu(menu, project)
        end
      end
    end
  end
end