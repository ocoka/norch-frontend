var techs=require("enb-bem-techs"),
    provide = require('enb/techs/file-provider');
var bh_html=require('enb-bh/techs/html-from-bemjson');
var bh_server=require('enb-bh/techs/bh-server');
var borschik=require('enb-borschik/techs/borschik');
var js=require("enb/techs/js");
var stylus=require('enb-stylus/techs/css-stylus');
var ymodules=require('enb-modules/techs/prepend-modules');
/**
 *
 * @param {ProjectConfig} config
 */
module.exports = function(config) {
    //config.
    config.node("pages/index",
        /**
         @param {NodeConfig} nodeConfig
         */
        function(nodeConfig)
        {
            nodeConfig.addTechs([
                [techs.levels,{"levels":[
                                        {path:"library",check:true}
                                                                    ]
                                                                    }],
                [provide, { target: '?.bemjson.js' }],
                [techs.bemjsonToBemdecl],
                [techs.deps],
                [techs.files],
                [bh_server,{jsCls:false}],
                [bh_html],
                [js,{target:"?.pre.js"}],
                [ymodules,{source:"?.pre.js"}],
                [borschik, {
                    sourceTarget: '?.js',
                    destTarget: '_?.js'}],
                [stylus]

            ]);
            nodeConfig.addTargets(["?.html","_?.js", "?.css"]);


        }
    );
};
