class AddUncommentableToNews < ActiveRecord::Migration
  def change
    add_column :news, :uncommentable, :boolean,  default: false
  end
end
