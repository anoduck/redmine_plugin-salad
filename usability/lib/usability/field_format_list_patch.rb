module Usability
  module FieldFormatListPatch
    def self.included(base)
      base.class_eval do
        field_attributes :us_store_for_new
      end
    end
  end
end