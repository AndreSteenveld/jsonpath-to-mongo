import $ from "core-js/library";
import aesprim from "jsonpath/lib/aesprim";

import { empty, to_object } from "../utilities";
import expression from "./expression";

export const parse = {

    root( $match = empty( ), [ node = null, ...tail ] = this ){ 
        
        return jsonpath( $match, tail ); 
    
    },

    identifier( $match = empty( ), [ node = null, ...tail ] = this ) {

        return $.Object
            .entries( jsonpath( $match, tail ) )
            .map( ([ key, value ]) => 
        
                [ node.value, key ]
                    .filter( truthy )
                    .join( "." )
                
            )
            .reduce( to_object, empty( ) );

    },

    filter_expression( $match = empty( ), [ node = null, ...tail ] = this ){

        const 
            [ filter_expression ] = node.value.match( /(^\s*\?\s*\(\s*)(.*?)(\s*\)\s*$)/ ).slice( 2, 3 ),
            ast = aesprim.parse( filter_expression );

        return tail :: jsonpath( expression( $match, ast.body ) );
        
    }

}

export function jsonpath( $match = empty( ), [ node = null, ...tail ] = this ){

    if( null === node )
        return $match;

    switch( node.type ){

        //
        // jsonpath node types
        //
        case "root"              : return parse.root( $match, [ node, ...tail ] );
        case "identifier"        : return parse.identifier( $match, [ node, ...tail ] );
        
        // We flatten the filter and script expression in to the entire AST, there is no reason
        // to catch these as they never appear in the generated AST.
        case "filter_expression" : return parse.filter_expression( $match, [ node, ...tail ] );
        
        //
        // Unknown node types...
        //
        default : {

            console.warn( `Unknown node type :: ${ node }` );

            return $match;
            
        }

    }

};

export default jsonpath;