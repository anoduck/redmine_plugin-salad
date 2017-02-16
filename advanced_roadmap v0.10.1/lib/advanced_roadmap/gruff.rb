# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

# Extra full path added to fix loading errors on some installations.

%w(
  base
  area
  bar
  line
  dot
  pie
  spider
  net
  stacked_area
  stacked_bar
  side_stacked_bar
  side_bar
  accumulator_bar

  scene

  mini/legend
  mini/bar
  mini/pie
  mini/side_bar
).each do |filename|
  require File.dirname(__FILE__) + "/gruff/#{filename}"
end

# TODO bullet
