export function log(message: String, level?: 'info' | 'warn' | 'error') {
    // WHEN RUNNING WEBPACK WITH `PRODUCTION` build,
    // IT WILL REMOVE THE FOLLOWING CODE.

    // if (NODE_ENV !== 'production') {
    if (level === 'error') {
        console.error(message);
    } else if (level === 'warn') {
        console.warn(message);
    } else {
        console.log(message);
    }
    // }
}
