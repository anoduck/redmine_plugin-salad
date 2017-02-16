class CmRole < ActiveRecord::Base
  belongs_to :roles, class_name: 'Role', foreign_key: :role_id
end