# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

class Milestone < ActiveRecord::Base
  
  belongs_to :user
  belongs_to :project
  has_many :milestone_versions, :dependent => :destroy
  has_many :versions, :through => :milestone_versions

  include Redmine::SafeAttributes
  safe_attributes :name, :description, :milestone_effective_date
  attr_protected :id

  validates_presence_of :name
  validates_uniqueness_of :name, :scope => [:project_id]
  validates_length_of :name, :maximum => 60
  validates_format_of :milestone_effective_date, :with => /\A\d{4}-\d{2}-\d{2}\z/,
                      :message => 'activerecord_error_not_a_date', :allow_nil => true
  
  def to_s
    name
  end
  
  def <=>(milestone)
    if self.milestone_effective_date
      if milestone.milestone_effective_date
        if self.milestone_effective_date == milestone.milestone_effective_date
          self.name <=> milestone.name
        else
          self.milestone_effective_date <=> milestone.milestone_effective_date
        end
      else
        -1
      end
    else
      if milestone.milestone_effective_date
        1
      else
        self.name <=> milestone.name
      end
    end
  end

  def versions?(version)
    versions.index(version) != nil
  end

  def completed?
    milestone_effective_date && (milestone_effective_date <= Date.today)
  end

end
