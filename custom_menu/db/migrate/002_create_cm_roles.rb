class CreateCmRoles < ActiveRecord::Migration
  def change
    create_table :cm_roles do |t|
      t.integer :item_id, null: false
      t.integer :role_id, null: false
    end

    add_column :cm_items, :visibility, :integer, default: 0
  end
end