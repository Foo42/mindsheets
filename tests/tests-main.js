require.config(
	{
		baseUrl:'../',
		'packages': [{ 'name': 'lodash', 'location': 'lib/lodash', 'main': 'lodash' }]
	}
);

require(['tests/Core-Tests/CoreTests', 'tests/Evaluator-Tests/SimpleEvaluatorTests', 'tests/ViewModel-Tests/ViewModelTests'], function(){
    QUnit.start();
});