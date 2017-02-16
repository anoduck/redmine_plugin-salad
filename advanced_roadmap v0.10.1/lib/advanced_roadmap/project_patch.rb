# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

require_dependency 'projects_controller'

module AdvancedRoadmap
  module ProjectPatch
    def self.included(base)
      base.class_eval do
        has_many :milestones
      end
    end
  end
end
