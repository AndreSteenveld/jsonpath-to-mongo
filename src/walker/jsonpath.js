import $ from "core-js/library";
import aesprim from "jsonpath/lib/aesprim";

import { $MATCH, $GEO_NEAR } from "../";
import { empty, to_object, truthy, property } from "../utilities";
import { default as expression, script_expression } from "./expression";

export const parse = {

    root( $match, [ node = null, ...tail ] = this ){ 
        
        return jsonpath( $match, tail ); 
    
    },

    identifier( $match, [ node = null, ...tail ] = this ) {

        const computed_tail = jsonpath( $match, tail );

        $match[ $MATCH ] = $.Object
            .entries( computed_tail :: property( $MATCH, computed_tail ) )
            .map( ([ key, value ]) => {

                if( "$" === key[ 0 ] )
                    return [ node.value, { [ key ] : value } ];

                const extended_key = [ node.value, key ]
                    .filter( truthy )
                    .join( "." );

                return [ extended_key, value ];
                
            })
            .reduce( to_object, empty( ) );

        return $match;

    },

    wildcard: function( $match, [ node = null, ...tail ] = this ){

        const 
            computed_tail = tail :: jsonpath( empty( ) ),
            $elemMatch = computed_tail :: property( $MATCH, computed_tail );

        Object.assign( $match[ $MATCH ], { $elemMatch } );

        return $match;

    },

    filter_expression( $match, [ node = null, ...tail ] = this ){

        const 
            [ filter_expression ] = node.value.match( /(^\s*\?\s*\(\s*)(.*?)(\s*\)\s*$)/ ).slice( 2, 3 ),
            ast = aesprim.parse( filter_expression, { 
                tokens : true,
                range  : true,
                loc    : true,
                source : filter_expression            
            });

        return tail :: jsonpath( expression( $match, [ ast ] ) );
        
    },

    script_expression( $match, [ node = null, ...tail ] = this ){

        const
            [ script ] = node.value.match( /(^\s*\(\s*)(.*?)(\s*\)\s*$)/ ).slice( 2, 3 ),
            ast = aesprim.parse( script, { 
                tokens : true,
                range  : true,
                loc    : true,
                source : script            
            });

        return tail :: jsonpath( script_expression( $match, [ ast ] ) );

    }

};

export function jsonpath( $match, [ node = null, ...tail ] = this ){

    if( null === node )
        return $match;

    switch( node.type ){

        //
        // jsonpath node types
        //
        case "root"              : return parse.root( $match, [ node, ...tail ] );
        case "identifier"        : return parse.identifier( $match, [ node, ...tail ] );
        case "wildcard"          : return parse.wildcard( $match, [ node, ...tail ] );
        
        // We flatten the filter and script expression in to the entire AST, there is no reason
        // to catch these as they never appear in the generated AST.
        case "filter_expression" : return parse.filter_expression( $match, [ node, ...tail ] );
        case "script_expression" : return parse.script_expression( $match, [ node, ...tail ] );
        //
        // Unknown node types...
        //
        default : {

            console.warn( `Unknown node type :: ${ node }` );
            console.dir( node );

            return $match;
            
        }

    }

};

export default jsonpath;