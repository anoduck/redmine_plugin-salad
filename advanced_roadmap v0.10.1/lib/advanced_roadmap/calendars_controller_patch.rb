# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

require_dependency 'calendars_controller'

module AdvancedRoadmap
  module CalendarsControllerPatch
    def self.included(base)
      base.class_eval do

        around_filter :add_milestones, :only => [:show]

        def add_milestones
          yield
          view = ActionView::Base.new(File.join(File.dirname(__FILE__), '..', '..', 'app', 'views'))
          view.class_eval do
            include ApplicationHelper
          end
          milestones = []
          @query.milestones.where(['milestones.milestone_effective_date BETWEEN ? AND ?',
                                   @calendar.startdt,
                                   @calendar.enddt]).each do |milestone|
            milestones << {:name => milestone.name,
                           :url => url_for(:controller => :milestones,
                                           :action => :show,
                                           :id => milestone.id),
                           :day => milestone.milestone_effective_date.day}
          end
          response.body += view.render(:partial => 'hooks/calendars/milestones',
                                       :locals => {:milestones => milestones})
        end

      end
    end
  end
end
