import jsonpath from "jsonpath";

import { $MATCH, $GEO_NEAR } from "../";
import { empty, flatten } from "../utilities";
import { get } from "../utilities";

export const parse_expressions_as = {

    binary( $match = empty( ), binary_expression = this ){

        function in_operator( $match, node ){

            // In case we want to express the not-in operator from mongo we overload in and
            // like the not-or a unary not followed by an array.
            //case "in ![ ]":

        }

        function equality_operator( $match, node ){

            function to_mongo_operator( operator = this ){
        
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
       
            const { left, right } = node;
                
            const operator = node.operator :: to_mongo_operator( );
        
            const 
                path  = jsonpath.value([ left, right ], `$[?( (/MemberExpression|Identifier/) . test( @.type ) )]` ) :: expression( ),
                value = jsonpath.value([ left, right ], `$[?( (/Literal/) . test( @.type ) )]` ) :: expression( );
        
            return Object.assign( $match, { [ path.join( "." ) ] : { [ operator ] : value } } ); 
        
        }
        
        function comparison_operator( $match, node ){
        
            function invert( operator = this ){
        
                switch( operator ){
        
                    case "<"  : return ">";
                    case "<=" : return ">=";
                    
                    case ">"  : return "<";
                    case ">=" : return "<=";
                
                }
        
            }
        
            function to_mongo_operator( operator = this ){ 
        
                switch( operator ){
        
                    case "<"  : return "$lt";
                    case "<=" : return "$lte";
                    
                    case ">"  : return "$gt";
                    case ">=" : return "$gte";
                
                }
        
            }
        
            const { left, right } = node;
            
            const 
                operator = left.type  === "Literal" ? node.operator :: invert( ) :: to_mongo_operator( )
                         : right.type === "Literal" ? node.operator :: to_mongo_operator( )
                         :                            new Error( "Neither side of the operator is a literal" );
        
            if( operator instanceof Error ) 
                throw operator;
        
            const 
                path  = jsonpath.value([ left, right ], `$[?( (/MemberExpression|Identifier/) . test( @.type ) )]` ) :: expression( ),
                value = jsonpath.value([ left, right ], `$[?( (/Literal/) . test( @.type ) )]` ) :: expression( );
        
            return Object.assign( $match, { [ path ] : { [ operator ] : value } } );
        
        }
            
        switch( binary_expression.operator ){

            case "=="  :
            case "===" :
            case "!="  :
            case "!==" :
                return equality_operator( $match, binary_expression );
                
            case "<"   :
            case "<="  :
            case ">"   :
            case ">="  : 
                return comparison_operator( $match, binary_expression );

            case "in" : 
                return in_operator( $match, binary_expression );
               
            default:
                throw new Error( `walker/expression :: Unknown binary operator [ ${ binary_expression.operator } ]` );

        }

    },

    member( $match = null, member_expression = this ){

        const path = [ ];

        if( "Identifier" === member_expression.type )
            path.push( member_expression.name );

        else if( "MemberExpression" === member_expression.type )
            path.push(
                member_expression.object :: expression( null ), 
                member_expression.property :: expression( null )
            );

        return path
            .reduce( flatten, [ ] )
            .filter( ( property ) => "@" !== property );

    },

    literal( $match = null, literal_expression = this ){

        return literal_expression.value;
        
    },

    array( $match = null, array_expression = this ){ 

        return array_expression.elements.map( ( e ) => e :: expression( ) );

    },

    object( $match = null, object_expression = this ){ },

    call( $match = empty( ), call_expression = this ){ },

    logical( $match = empty( ), logical_expression = this ){ 

        function and( $match, node ){

            return Object.assign( 
                
                $match, 
                
                { 
                    $and : [
                        node.left :: expression( empty( ) ),
                        node.right :: expression( empty( ) )
                    ]
                }

            );

        }

        function or( $match, node ){

            return Object.assign(

                $match,

                {
                    $or : [
                        node.left :: expression( empty( ) ),
                        node.right :: expression( empty( ) )
                    ]
                }

            );

        }

        switch( logical_expression.operator ){

            case "&&" : return and( $match, logical_expression );
            case "||" : return or( $match, logical_expression );

            default :
                throw new Error( `walker/expression :: Unknown logical operator [ ${ logical_expression.operator } ]` );


        }

    },

    unary( $match = null, unary_expression = this ){ },

};

export function expression( $match = null, node = this ){

    switch( node.type ){

        case "LogicalExpression" : return parse_expressions_as.logical( $match, node );
        case "BinaryExpression"  : return parse_expressions_as.binary( $match, node ); 

        case "Literal" : return parse_expressions_as.literal( $match, node );
        case "ArrayExpression": return parse_expressions_as.array( $match, node );

        case "Identifier":
        case "MemberExpression" : 
            return parse_expressions_as.member( $match, node );

        case "ObjectExpression":
        case "CallExpression":                    
        case "UnaryExpression":
            throw new Error( "Expression type not implemented yet" );

        default : {

            console.warn( `walker/expression :: Unknown expression type [ ${ node.type } ]` );

            return $match;

        }
    
    }

}

export default function filter_expression( $match, [ node = null, ...tail ] = this ){

    if( null === node )
        return $match;

    const program_body = jsonpath.query([ node ], `$[?( @.type === "Program" )].body` );

    if( 0 === program_body.length )
        throw new Error( "No program body" );

    const expressions = jsonpath.query( program_body[ 0 ], `$[?( @.type === "ExpressionStatement" )].expression` );

    if( 1 !== expressions.length )
        throw new Error( "Too many expressions!" );

    //
    // We might want to take a look at actually constructing a pipeline instead of a simple match... this would also
    // help with the $geoNear type of operations.
    //
    // if( program_body.length !== expressions.length )
    //     console.warn( "Not all statements provided are expression statements (non expression statements have been filtered and are effectively a NoOp)" );
    // 
    // if( 1 < filter_expressions.length )
    //     console.warn( "More than one expression supplied, this will be interperted as an implicit AND operation" );
    //

    return expression( $match, expressions[ 0 ] );

};

export function script_expression( $match, [ node = null, ...tail ] = this ){

    if( null === node )
        return $match;

    debugger;

    const 
        script = node :: get( "/body/0/expression" ),
        callee = script.callee :: expression( );
        
    const [ coordinates, [ minDistance = 0, maxDistance = 40075 ] = [ ], distanceField = "@distance" ] = script.arguments.map( n => n :: expression( ) );

    if( "@geo.distance" !== callee.join( "." ) )
        throw new Error( "Unknown script!" );

    $match[ $GEO_NEAR ] = [ 

        { $geoNear : {

            spherical : true,
            limit     : 0xFFFFFFFF,

            minDistance,
            maxDistance,

            distanceField,

            near : {
                type : "Point",
                coordinates
            }

        }}, 

        { $project: {

            _id : true,
            [ distanceField ] : true,

        }}
    
    ]; 


    return $match;

}