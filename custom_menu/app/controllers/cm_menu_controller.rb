class CmMenuController < ApplicationController
  layout 'admin'

  before_filter :find_item, only: [:destroy, :update, :edit]
  before_filter :build_new_item, only: [:new, :create]

  helper :cm_menu

  def index
    @top_menu_items = CmItem.where(menu: 'top_menu').sorted
    @account_menu_items = CmItem.where(menu: 'account_menu').sorted
  end

  def rebuild_menu
    top_tree = params[:top_menu]
    account_tree = params[:account_menu]
    CmItem.transaction do
      CmItem.destroy_all

      @errors = {}
      @errors = build_tree(top_tree, 'top_menu') if top_tree.present?
      @errors = @errors.merge(build_tree(account_tree, 'account_menu')) if account_tree.present?

      if @errors.present?
        raise ActiveRecord::Rollback
      end
    end

    if @errors.blank? && (Setting.plugin_custom_menu || {})['use_cache']
      Thread.new do
        Rails.cache.delete_matched(/custom_menu\/\d+\/\w+\/\w+\/user_menu/, nil)
      end
    end
  end

  private

  def build_new_item
    @item = CmItem.new_subclass_instance(params[:type] || (params[:cm_item] || {})[:type], params[:cm_item])
    if @item.blank?
      render_404
    end
  end

  def find_item
    @item = CmItem.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_404
  end

  def build_tree(tree, menu, parent=nil)
    errors_list = {}
    tree.each do |k, t|
      item = CmItem.new_subclass_instance(t[:type],
                                          { code: t[:code],
                                            menu: menu,
                                            caption: t[:caption],
                                            custom_url: t[:custom_url] || '',
                                            options: { class: t[:options_class] },
                                            logged: t[:logged],
                                            visibility: t[:visibility],
                                            query_id: t[:itemQuery]
                                          })

      item.visibility = CmItem::VISIBILITY_PUBLIC if item.visibility.blank?

      if t[:roles].present? && item.visibility == CmItem::VISIBILITY_ROLE
        item.role_ids = t[:roles].split(',')
      else
        item.role_ids = [];
      end

      next if item.blank?

      item.parent_id = parent.try(:id)
      unless item.save
        errors_list[t[:id]] ||= []
        errors_list[t[:id]] += item.errors.full_messages
        next
      end

      if t[:children].present? && t[:children].is_a?(Hash) && !item.new_record?
        errors_list = errors_list.merge(build_tree(t[:children], menu, item))
      end
    end
    errors_list
  end
end