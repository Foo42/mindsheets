require.config({baseUrl:'../'});

require(['tests/Core-Tests/CoreTests', 'tests/Evaluator-Tests/SimpleEvaluatorTests', 'tests/ViewModel-Tests/ViewModelTests'], function(){
    QUnit.start();
});