module Usability
  module CustomFieldsControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)
    end

    module InstanceMethods
      def move_to_position
        cf = CustomField.find(params[:custom_field_id])
        if params[:new_position].to_i + 1 > cf.position
          CustomField.where('type = ? and position > ? and position <= ?', cf.type, cf.position, params[:new_position].to_i + 1).update_all('position = position - 1')
        elsif params[:new_position].to_i + 1 < cf.position
          CustomField.where('type = ? and position < ? and position >= ?', cf.type, cf.position, params[:new_position].to_i + 1).update_all('position = position + 1')
        end
        cf.update_attributes(position: params[:new_position].to_i + 1)

        if request.xhr?
          render nothing: true
          return
        end

        redirect_to action: 'index'
      end
    end

  end
end