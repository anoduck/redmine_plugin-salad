module UsabilityHelper
  def us_email_issue_attributes(issue, user)
    items = []
    %w(author status priority assigned_to category fixed_version).each do |attribute|
      unless issue.disabled_core_fields.include?(attribute + "_id")
        items << [l("field_#{attribute}"), issue.send(attribute)]
      end
    end
    issue.visible_custom_field_values(user).each do |value|
      items << [value.custom_field.name, show_value(value, false)]
    end
    items
  end
end