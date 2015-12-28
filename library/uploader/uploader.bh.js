/**
 *
 * @param {BH} bh
 */
module.exports=function(bh){
    bh.match("uploader",
        /**
         * @param {Ctx} ctx
         * @param json
         */
        function(ctx,json){
            ctx.mix({block:"js-init"});
            ctx.js({url:json.url});
        }
    );
}
