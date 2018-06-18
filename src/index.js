import jsonpath from "jsonpath";
import parse_expression from "jsonpath/lib/aesprim";

function ast_to_mongo( options, ast = this ){

    return [ ];

}

function expand( options = { }, node = this ){ 
    
    if( "script_expression" === node.type )
        throw new Error( "Expansion of script expressions is not supported" );

    return Object.assign( node, { ast } ); 

}

export function transform( options = { }, path = this ){

    const 
        ast = jsonpath
            .parse( path )
            .map( ( node ) => {

                switch( node.type ){

                    case "script_expression" :
                    case "filter_expression" : 
                        return node :: expand( options );

                    default : return node;

                }

            });

    return [ ...ast :: ast_to_mongo( options ) ];

}

export default transform;