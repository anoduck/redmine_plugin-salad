module Usability
  module WikiPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        alias_method_chain :heads_for_wiki_formatter, :usability
      end
    end

    module InstanceMethods
      def heads_for_wiki_formatter_with_usability
        heads_for_wiki_formatter_without_usability
        unless @extentions_for_wiki_formatter_included
          content_for :header_tags do
            javascript_include_tag('wiki-extentions.js', :plugin => :usability) +
            javascript_include_tag("jstoolbar-lang/jstoolbar-#{%w(ru en).include?(current_language.to_s.downcase) ? current_language.to_s.downcase : 'en'}.js", :plugin => :usability) +
            stylesheet_link_tag('wiki-extentions.css', :plugin => :usability)
          end
          @extentions_for_wiki_formatter_included = true
        end
      end
    end

  end
end