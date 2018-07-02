import oo_pointer from "json8-pointer";

export function noop( ){ }

export function identity( v ){ return v; }

export function value( value ){
    
    return "undefined" === typeof this ? value : this;
    
}

export function get( path, default_value ){
    
    return oo_pointer.find( this, path ) :: value( default_value );
    
}

export function property( key, default_value ){

    return key in this ? this[ key ] : default_value;

}

export function empty( ){

    return Object.create( null );

}

export function flatten( target = this, array_or_object ){

    return target.concat( array_or_object );

}

export function to_object( target, [ key, value ] ){

    return Object.assign( target, { [ key ] : value } );

}

export function truthy( v = this ){

    return true === !!v;

}

export function falsey( v = this ){

    return false === !!v;

}

export function tuplerize( size = 2 ){

    return ( tuples, _, index, array ) => 
        index % size 
            ? tuples
            : tuples.concat([ array.slice( index, size + index ) ]);

}

