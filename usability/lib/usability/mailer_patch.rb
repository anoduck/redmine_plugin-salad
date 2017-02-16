module Usability
  module MailerPatch
    def self.included(base)
      base.send :include, AbstractController::Callbacks
      base.send :include, InstanceMethods

      base.class_eval do
        layout :us_mailer_layout
        before_filter :us_mailer_view
      end
    end

    module InstanceMethods
      def us_mailer_view
        if (Setting.plugin_usability || {})['replace_mails_view']
          prepend_view_path File.join(Redmine::Plugin.find(:usability).directory, 'app', 'views', 'us_mailer_patched_views')
        end
      end

      def us_mailer_layout
        (Setting.plugin_usability || {})['replace_mails_view'] && !Setting.plain_text_mail? ? 'rmp_mailer' : 'mailer'
      end
    end
  end
end