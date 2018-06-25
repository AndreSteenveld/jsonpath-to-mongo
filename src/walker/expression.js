import { empty } from "../utilities";
import jsonpath from "jsonpath";

function equality_operator( $match, node, left, right ){

    function operator( operator = this ){

        switch( operator ){

            case "=="  :
            case "===" :
                return "$eq";

            case "!="  :
            case "!==" :
                return "$neq";

            default :
                throw new Error( "Unknown equality operator" );

        }

    }

    const operator = node.operator :: operator( );

    const 
        path  = jsonpath.value([ left, right ], `$..type[?( @ == "MemberExpression" )]` ),
        value = jsonpath.value([ left, right ], `$..type[?( @ == "Literal" )]` );

    return Object.assign( $match, { [ path ] : { [ operator ] : value } } ); 

}

function comparison_operator( $match, node, left, right ){

    function invert( operator = this ){

        switch( operator ){

            case "<"  : return ">";
            case "<=" : return ">=";
            
            case ">"  : return "<";
            case ">=" : return "<=";
        
        }

    }

    function operator( operator = this ){ 

        switch( operator ){

            case "<"  : return "$lt";
            case "<=" : return "$lte";
            
            case ">"  : return "$gt";
            case ">=" : return "$gte";
        
        }

    }

    const 
        operator = left.type  === "literal" ? node.operator :: invert( ) :: operator( )
                 : right.type === "literal" ? node.operator :: operator( )
                 :                            new Error( "Neither side of the operator is a literal" );

    if( operator instanceof Error ) 
        throw operator;

    const 
        path  = jsonpath.value([ left, right ], `$..type[?( @ == "MemberExpression" )]` ),
        value = jsonpath.value([ left, right ], `$..type[?( @ == "Literal" )]` );

    return Object.assign( $match, { [ path ] : { [ operator ] : value } } );

}

export const parse = { 

    program( $match = this, [ node = null, ...tail ] = this ){ 

        return expression( $match, node.body );

    },

    binary_expression( $match = this, [ node = null, ...tail ] = this ){

        const 
            left  = expression( empty( ), node.left ),
            right = expression( empty( ), node.right );
            
        switch( node.operator ){

            //case "&&":
            
            //case "||":
            // In case we want to express the not-or operator from mongo we are going
            // to overload the || operator, exprecting a unary not followed by an array.
            //case "|| ![ ]" :

            case "=="  :
            case "===" :
            case "!="  :
            case "!==" :
                return equality_operator( $match, node, left, right );
                
            case "<"   :
            case "<="  :
            case ">"   :
            case ">="  : 
                return comparison_operator( $match, node, left, right );

            //case "in" : 
            // In case we want to express the not-in operator from mongo we overload in and
            // like the not-or a unary not followed by an array.
            //case "in ![ ]":

            default: {

                throw new Error( "Not implemented" );

            }

        }

    }

};

export function expression( $match = empty( ), [ node = null, ...tail ] = this ){

    if( null === node )
        return $match;

    switch( node.type ){

        case "Program": return parse.program( $match, [ node, ...tail ] );
        case "BinaryExpression" : return parse.binary_expression( $match, [ node, ...tail ] );

        //
        // Unknown node types...
        //
        default : {

            console.warn( `Unknown node type :: ${ node }` );

            return $match;
            
        }

    }

};

export default expression;