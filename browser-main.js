// Start the main app logic.

define.amd.jQuery = true;

require.config({paths:{'jquery':'lib/jquery/jquery-1.8.2.min'}})

require(['jquery','lib/knockout/knockout-2.2.0','ui/ui'],
function($,ko,viewModel) {
    $(document).ready(function(){
		ko.applyBindings(new viewModel.RootViewModel());	
	});
});