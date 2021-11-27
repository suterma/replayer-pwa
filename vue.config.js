//vue.config.js

//Setting the environment variables
const child_process = require('child_process');
function git(command) {
    return child_process
        .execSync(`git ${command}`, { encoding: 'utf8' })
        .trim();
}
process.env.VUE_APP_VERSION = require('./package.json').version;
process.env.VUE_APP_GIT_VERSION = git('describe --always');
process.env.VUE_APP_GIT_AUTHOR_DATE = git('log -1 --format=%aI');

//Defining the config
module.exports = {
    chainWebpack: (config) => {
        config.plugin('html').tap((args) => {
            args[0].title = 'Replayer';
            return args;
        });
    },
};
