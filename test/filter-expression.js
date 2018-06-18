import test from "ava";
import transform from "../src";

test( "path :: $[?( true )]", ( assert ) => {

    const pipeline = "$[?( test )]" :: transform( );

    assert.fail( );

});

test( "path :: $[?( false )]", ( assert ) => {

    const pipeline = "$[?( false )]" :: transform( );

    assert.fail( ); 

});

test( "path :: $[?( @ )]", ( assert ) => {

    const pipeline = "$[?( @ )]" :: transform( );

    assert.fail( );

});

test( "path :: $[?( true === false )]", ( assert ) => {

    const pipeline = "$[?( true === false )]" :: transform( );

    assert.fail( );

});