
function Pluralizer(forms){
    var _cases=[2,0,1,1,1,2];
    return {
        get:function(n) {
            return forms[(n%100 > 4 && n%100 < 20) ? 2 : _cases[Math.min(n%10, 5)]];
        }
    }
}
if (modules && modules.define){
modules.define("base-b",[],function(provide){
   provide(Pluralizer);
   }
   );
 }else if (module && module.exports){
   module.exports=Pluralizer;
 }
