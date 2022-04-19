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

//webpack-bundle-analyzer will provide a visual guide to the size of items in each bundle
const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//Defining the config
module.exports = {
    chainWebpack: (config) => {
        config.plugin('html').tap((args) => {
            args[0].title = 'Replayer';
            return args;
        });
    },
    //See https://cli.vuejs.org/config/#publicpath, using the relative path option. Solves linking problems for images
    publicPath: './',
    productionSourceMap: true,
    css: {
        sourceMap: true,
    },
    integrity: true,
    configureWebpack: {
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'disabled',
                generateStatsFile: true,
            }),
        ],
    },
    //Using workbox from a local file, instead of the googleapi CDN. See https://github.com/vuejs/vue-cli/issues/3361#issuecomment-457134243
    pwa: {
        workboxOptions: {
            importWorkboxFrom: 'local',
        },
    },
};
