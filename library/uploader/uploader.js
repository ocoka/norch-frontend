modules.define("uploader",["jquery"],function(provide,$){
   provide(function(dom,data){
       var $this=$(dom);
       $this.on("dragenter",function(e){
         $this.addClass("uploader_drag_enter");
       }).on("dragleave",function(e){
         $this.removeClass("uploader_drag_enter");
       });
   });
});
