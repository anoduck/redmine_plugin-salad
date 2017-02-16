class AddUsabilityAttachmentGroup < ActiveRecord::Migration
  def change
    add_column :attachments, :us_group_id, :integer, null: true
  end
end