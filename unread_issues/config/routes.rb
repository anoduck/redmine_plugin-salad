# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

get 'issue_reads/count/:req', controller: 'issue_reads', action: 'count'
get 'issues/:id/view_stats', controller: :issue_reads, action: :view_stats, id: /\d+/