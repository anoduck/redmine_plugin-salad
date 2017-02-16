# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
  resources :cm_menu do
    collection do
      post 'rebuild_menu'
    end
  end
end