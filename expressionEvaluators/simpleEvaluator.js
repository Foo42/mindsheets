define([],function(){
    var module = {};    
    
    module.SimpleEvaluator = (function(){

    	var StringIterator = function(s){
            var self = this;
            var position = 0;
            var length = s.length;

            this.moveNext = function(){
                position++;
                if(self.isPastEnd()){
                    return false;
                }
                return true;
            }

            this.current = function(){
                return self.isPastEnd() ? undefined : s[position];
            }

            this.isPastEnd = function(){
                return position >= length;
            }

            this.position = function(){
                return position;
            }
        }

        var shouldEvaluateAsExpression = function(input){
    		return typeof(input) === 'string' && input[0] === '=';
    	}

        var toBestType = function(input){        
            if(! isNaN(parseFloat(input))){
                return parseFloat(input);
            }

            return input;
        }
    
    	return function(dependencyValueLookup){
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

            var advanceToNextOccuranceOf = function(iterator, operator){
                var inQuotedString = false;
                var subExpressionDepth = 0;

                while(! iterator.isPastEnd()){
                    var c = iterator.current();

                    if(c === '"'){
                        inQuotedString = !inQuotedString
                    }
                    if(inQuotedString){
                        iterator.moveNext();
                        continue;
                    }

                    if(c === '('){
                        subExpressionDepth++;
                        iterator.moveNext();
                        continue;
                    }
                    if(c ===')'){
                        subExpressionDepth--;
                        iterator.moveNext();
                        continue;
                    }

                    if(subExpressionDepth !== 0){
                        iterator.moveNext();
                        continue;
                    }

                    if(c === operator){
                        return iterator;
                    }

                    iterator.moveNext();
                }
                return iterator;
            }

            var splitAt = function(s, i, shouldTrim){
                var pieces = [(s.substr(0,i)),(s.substr(i+1))];
                if(shouldTrim){
                    pieces = pieces.map(function(p){return p.trim()})
                }
                return pieces;
            };

            var stripOuterBrackets = function(expression){
                if(expression.length <= 0){
                    return expression;
                }

                if(expression[0] !== "("){
                    return expression;
                }

                var parenthesisDepth = 1;
                var position = 1; //we already know the first char is a (
                for(; position < expression.length; position++){
                    if(parenthesisDepth === 0){
                        return expression; //balancing parenthesis found before end of expression
                    }    

                    if(expression[position] == '('){
                        parenthesisDepth++;
                        continue;
                    }
                    if(expression[position] == ')'){
                        parenthesisDepth--;
                        continue;
                    }
                }

                if(expression[0] === "(" && expression[expression.length - 1] === ")"){
                    expression = expression.substr(1);   
                    expression = expression.substr(0,expression.length -1);
                }

                return expression;
            }

            var stripQuotes = function(s){
                var quoteCharacter = "\"";

                if(s.length <= 0){
                    return s;
                }

                
                if(s[0] === quoteCharacter){
                    s = s.substr(1);    
                }
                
                if(s[s.length - 1] === quoteCharacter){
                    s = s.substr(0,s.length -1);
                }

                return s;
            }
    
    		//Private
    		var evaluateExpression = function(expression){
    			expression = expression.trim();
                expression = stripOuterBrackets(expression);

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
                    var expressionIterator = new StringIterator(expression);
                    advanceToNextOccuranceOf(expressionIterator, operator.op);
                    if(!expressionIterator.isPastEnd()){
                        var pieces = splitAt(expression, expressionIterator.position());    
                        return operator.func(pieces);
                    }                    
    			};
    
    			//No operators found, treat as plain value                
    			var value = parseFloat(expression);
                if(!isNaN(value)){
                    return value;
                }

                return toBestType(dependencyValueLookup(stripQuotes(expression)));
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