

export function getCallerFunctionName() {
    var e = new Error('dummy');
    var stack = e.stack
        .split('\n')[2]
        // " at functionName ( ..." => "functionName"
        .replace(/^\s+at\s+(.+?)\s.+/g, '$1' );
    return stack
}
