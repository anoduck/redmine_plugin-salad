# encoding: UTF-8

# Copyright © Emilio González Montaña
# Licence: Attribution & no derivates
#   * Attribution to the plugin web page URL should be done if you want to use it.
#     https://redmine.ociotec.com/projects/advanced-roadmap
#   * No derivates of this plugin (or partial) are allowed.
# Take a look to licence.txt file at plugin root folder for further details.

get "milestones/total_graph", :to => "milestones#total_graph"
resources :projects do
  resources :milestones, :only => [:new, :create, :index]
end
resources :milestones, :only => [:show, :edit, :update, :destroy]
