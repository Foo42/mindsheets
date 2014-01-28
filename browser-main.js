// Start the main app logic.

define.amd.jQuery = true;

require.config({
	paths:{'jquery':'lib/jquery/jquery-1.8.2.min'},
	'packages': [{ 'name': 'lodash', 'location': 'lib/lodash', 'main': 'lodash' }]
});

var rootVM; //to allow access via dev tools console for probing


require(['jquery','lib/knockout/knockout-2.2.0','ui/ui'],
function($,ko,viewModel) {
    $(document).ready(function(){

    	document.querySelector('body').classList.add('ready-for-interaction');
    	var initialState = {
            format:1,
            data:{
                items:[
                    {
                    	name: 'example',
                        definition:'1',
                        display:{x:10,y:20}
                    }
                ]
            }
        };
        rootVM = new viewModel.RootViewModel(initialState);
		ko.applyBindings(rootVM);	
	});
});