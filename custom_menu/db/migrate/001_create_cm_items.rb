class CreateCmItems < ActiveRecord::Migration

  def change
    create_table :cm_items do |t|
      t.string :type, null: false
      t.string :menu, null: false
      t.string :code
      t.string :caption
      t.string :custom_url
      t.text :options
      t.boolean :logged
      t.boolean :admin
      t.integer :lft
      t.integer :rgt
      t.integer :parent_id
      t.timestamps
    end
  end

end