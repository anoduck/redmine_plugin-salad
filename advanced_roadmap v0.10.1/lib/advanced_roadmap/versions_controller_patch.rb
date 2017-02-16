# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

require_dependency 'versions_controller'

module AdvancedRoadmap
  module VersionsControllerPatch
    def self.included(base)
      base.class_eval do
  
        def index_with_plugin
          index_without_plugin
          @totals = Version.calculate_totals(@versions)
          Version.sort_versions(@versions)
        end
        alias_method_chain :index, :plugin
  
        def show
          @issues = @version.sorted_fixed_issues
        end
      
      end
    end
  end
end
