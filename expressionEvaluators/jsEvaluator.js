define(['lib/continuum/continuum'],function(continuum){
    var module = {};

    var realm = continuum.createRealm();
    var $array = realm.evaluate('[5, 10, 15, 20]');

    module.JsEvaluator = (function(){
    	
    	var shouldEvaluateAsExpression = function(input){
    		return typeof(input) === 'string' && input[0] === '=';
    	}
    
    	return function(){
    		var self = this;
    
    		//Private
    		var applyOperator = function (terms, operatorFunction) {
    			var total =  evaluateExpression(terms[0]);
    			for (var i = 1; i < terms.length; i++) {
    				var term = terms[i];
    				total = operatorFunction(total, evaluateExpression(term));
    			};
    			return total;			
    		}
    
    		//Private
    		var evaluateExpression = function(expression){
    			var operators = [
    				
    				{op:'+',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 + operand2;
    					});
    				}},
    
    				{op:'-',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 - operand2;
    					});
    				}},
    
    				{op:'*',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 * operand2;
    					});
    				}},
    
    				{op:'/',
    				func:function(terms){
    					return applyOperator(terms, function (operand1, operand2){
    						return operand1 / operand2;
    					});
    				}}
    			];
    
    			//Find first operator which appears
    			for (var i = 0; i < operators.length; i++) {
    				var operator = operators[i];
    				var pieces = expression.split(operator.op);
    				if(pieces.length > 1)
    				{
    					//apply operator
    					return operator.func(pieces);
    				}
    
    			};
    
    			//No operators found, treat as plain value
    			return parseInt(expression);					
    		}
    
    
            var findQuotedStrings = function(string){
                var quotedStrings = []
                var openQuote = undefined;
                
                for (var i = 0; i < string.length; i++) {
                    var c = string[i];
                    if(c === '"'){
                        if(openQuote){
                            openQuote.end = i;
                            quotedStrings.push(openQuote);
                            openQuote = undefined;
                        }
                        else{
                            openQuote = {start:i,end:undefined};
                        }
                    }
                }
                return quotedStrings;
            }
    
    		//Public
            self.getDependencies = function(expression){
                return findQuotedStrings(expression).map(function(indexPair){return expression.substring(indexPair.start+1, indexPair.end)});
            }
            
    		self.evaluate = function(expression){
    			if(shouldEvaluateAsExpression(expression))
    			{
    				//remove the leading equals
    				expression = expression.slice(1);
    				return evaluateExpression(expression);
    			}
    			
    			return expression;
    		}
    	}
    })();
    
    return module;
});