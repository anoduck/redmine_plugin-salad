# fix stupid using static version of gem. Only for RM 2.6.
if Redmine::VERSION::MAJOR == 2 && Redmine::VERSION::MINOR == 6
  module CollectiveIdea::Acts::NestedSet::Model
    def nested_set_scope(options = {})
      if (scopes = Array(acts_as_nested_set_options[:scope])).any?
        options[:conditions] = scopes.inject({}) do |conditions,attr|
          conditions.merge attr => self[attr]
        end
      end

      self.class.base_class.unscoped.nested_set_scope options
    end

    def reload_target(target, position)
      if target.is_a? self.class.base_class
        target.reload
      elsif position != :root
        nested_set_scope.find(target)
      end
    end
  end

  class CollectiveIdea::Acts::NestedSet::Move
    def new_parent
      case position
        when :child then target.id
        when :root  then nil
        else target[parent_column_name]
      end
    end

    def target_bound
      case position
        when :child then right(target)
        when :left then left(target)
        when :right then right(target) + 1
        when :root then nested_set_scope.pluck(right_column_name).max + 1
        else raise ActiveRecord::ActiveRecordError, "Position should be :child, :left, :right or :root ('#{position}' received)."
      end
    end
  end

  module CollectiveIdea::Acts::NestedSet::Model::Movable
    def move_to_root
      move_to self, :root
    end

    def move_to(target, position)
      prevent_unpersisted_move

      run_callbacks :move do
        in_tenacious_transaction do
          target = reload_target(target, position)
          self.reload_nested_set

          CollectiveIdea::Acts::NestedSet::Move.new(target, position, self).move
        end
        after_move_to(target, position)
      end
    end
  end
end