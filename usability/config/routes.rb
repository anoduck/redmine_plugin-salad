match '404', to: 'us_errors#error_404', via: [:get]
match '500', to: 'us_errors#error_500', via: [:get]

get 'users/:id/show_user_details', controller: 'users', action: 'show_user_details', id: /\d+/, as: "show_user_details"
post 'custom_fields/move_position', controller: 'custom_fields', action: 'move_to_position'

get 'easy_perplex', controller: :easy_perplex, action: :easy_perplex
get 'easy_perplex_actions(/:user_id)', controller: :easy_perplex, action: :easy_perplex_actions, user_id: /\d+/

get 'attachments/download/all/:id', controller: :attachments, action: :download_all