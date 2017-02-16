# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

require_dependency 'issues_controller'

module AdvancedRoadmap
  module IssuesControllerPatch
    def self.included(base)
      base.class_eval do
  
      protected
  
        def render(options = nil, extra_options = {}, &block)
          if ((@action_name == 'show') and
              (!(User.current.allowed_to?(:view_issue_estimated_hours, @project))) and
              (!(@journals.nil?)))
            @journals.each do |journal|
              journal.details = journal.details.where('prop_key != \'estimated_hours\'') unless journal.details.blank?
            end
            @journals.delete_if{|journal| journal.details.empty?}
          end
          super(options, extra_options)
        end
  
      end
    end
  end
end
