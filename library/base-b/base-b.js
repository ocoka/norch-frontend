modules.define("base-b",["jquery"],function(provide,$){
   provide(function(dom,data){
       $media=$(dom).find(".base-b__media");
       if (data['media_src']){
           $media.replaceWith("<img class='base-b__media' src='"+data['media_src']+"'/>");
       }
   });
});