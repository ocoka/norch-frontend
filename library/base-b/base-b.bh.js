/**
 *
 * @param {BH} bh
 */
module.exports=function(bh){
    bh.match("base-b",
        /**
         *
         * @param {Ctx} ctx
         * @param json
         */
        function(ctx,json){

            if (json.js_init){
                ctx.mix({block:"js-init"});
                ctx.js({media_src:json.media});
                ctx.content(
                    [
                        {elem:"media"},
                        {elem:"description",content:ctx.content()}],true
                );
            }
            else{
                ctx.content(
                    [
                        {elem:"media",src:json.media},
                        {elem:"description",content:ctx.content()}],true
                );
            }
    });
    bh.match("base-b__media",
        /**
         *
         * @param {Ctx} ctx
         * @param json
         */
        function(ctx,json){
            if (json.src){
                ctx.tag("img").attr("src",json.src);
            }
            else{
                ctx.tag("span").mod("preload",true,true);
            }
        });
}