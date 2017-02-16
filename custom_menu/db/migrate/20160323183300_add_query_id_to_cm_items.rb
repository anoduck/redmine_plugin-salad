class AddQueryIdToCmItems < ActiveRecord::Migration
  def change
    add_column :cm_items, :query_id, :integer
  end
end