# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

require_dependency 'issue'

module AdvancedRoadmap
  module IssuePatch
    def self.included(base)
      base.class_eval do
  
        def rest_hours
          if !@rest_hours
            @rest_hours = 0.0
            if children.empty?
              if !(closed?)
                if (spent_hours > 0.0) && (done_ratio > 0.0)
                  if done_ratio < 100.0
                    @rest_hours = ((100.0 - done_ratio.to_f) * spent_hours.to_f) / done_ratio.to_f
                  end
                else
                  @rest_hours = ((100.0 - done_ratio.to_f) * estimated_hours.to_f) / 100.0
                end
              end
            else
              children.each do |child|
                @rest_hours += child.rest_hours
              end
            end
          end
          @rest_hours
        end
  
        def parents_count
          parent.nil? ? 0 : 1 + parent.parents_count
        end
  
        def estimated_hours
          super if User.current.allowed_to?(:view_issue_estimated_hours, self.project)
        end
  
      end
    end
  end
end
