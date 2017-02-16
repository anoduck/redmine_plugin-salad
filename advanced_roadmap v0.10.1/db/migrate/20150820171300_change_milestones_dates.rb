# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/redmine-plugin-scrum
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

class ChangeMilestonesDates < ActiveRecord::Migration
  def self.up
    rename_column :milestones, :effective_date, :milestone_effective_date
  end

  def self.down
    rename_column :milestones, :milestone_effective_date, :effective_date
  end
end