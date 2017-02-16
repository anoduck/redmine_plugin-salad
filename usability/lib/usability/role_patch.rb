module Usability
  module RolePatch
    def self.included(base)
      base.extend ClassMethods

      base.class_eval do
        class << self
          alias_method_chain :find_all_givable, :usability
        end
      end
    end

    module ClassMethods
      def find_all_givable_with_usability
        # !!!!!!! NOT CALL WITHOUT METHOD !!!!!!!!
        Role.builtin.order(:name).to_a
      end
    end

  end
end