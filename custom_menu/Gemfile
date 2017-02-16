if RUBY_VERSION >= '1.9.3'
  rails_version = @dependencies.find { |d| d.name == 'rails' }
  rails_version = rails_version.requirement if rails_version
  rails_version = rails_version.requirements if rails_version
  rails_version = rails_version.first if rails_version && rails_version.is_a?(Array)
  rails_version = rails_version.last if rails_version && rails_version.is_a?(Array) && rails_version.size == 2
  if rails_version && rails_version.is_a?(Gem::Version) && rails_version.to_s >= '4.0.0'
    gem 'awesome_nested_set'
  end
end