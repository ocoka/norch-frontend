//Field validator plugin
FormValidator=function (options){
    //if (this instanceof FormValidator) throw new TypeError("FormValidator can't be called as constructor");
    var settings={
        errorContainerSelector:".error",
        errorFieldClass:"field-error"
    }
    var $=null;
    function _checkJQ(is_err){
        /* Нужен jQuery */
        if (typeof(window.jQuery) === "undefined") {
            cns=is_err?console.error:console.warn;
            cns("FormValidator: no jQuery available");
            return false;
        }
        $=window.jQuery;
        return true;
    }
    function _getValidatorElements(el){ //Получает элементы dom куда будут выводится ошибки валидации
        $el = $(el);
        var message_block = $el.parent().find(settings.errorContainerSelector); //Ищем блок сообщений который будем отображать (находится перед элементом)
        return message_block;
    }
    function _getForms(selector){
        var $forms=null;
        if (selector){
            $selector=$(selector);
            if ($selector.prop("tagName").toLowerCase()=="form"){
                $forms=$selector;
            }else{
                $forms = $("form",$selector);
            }

        }else{
            $forms = $("form");
        }
        return $forms;
    }

    function _getFormsWithValidator(selector){
        $forms=_getForms(selector);
        $forms.filter(function () { //Ищем формы
            var $form = $(this); // Сохраним JQ объект формы

            return ($form.find("input[data-validator],input[data-sanitizer]").filter(function () { //Ищем в формах элементы которые требуют валидации, если такие эл-ты есть то форма подходит, вернем истину для фильтра
                    $this=$(this);
                    $this.data("validator.elements", _getValidatorElements($this));
                    _makeSanitizer($this);
                    return true; //Возвращаем истину на добавление в фильтр;
                }
            ).length > 0);
        }).attr("novalidate",true);
        return $forms;
    }

    function _makeSanitizer($element){
        var sanitizer=$this.data('sanitizer');
        switch (sanitizer) {
            case "nospace":
                $element.on("keydown.sanitizer",function(e){
                    if (e.keyCode==32) return false;
                });
                break;
            default:
                break;
        }
    }

    function _findFailedFields($form){
        if ($form instanceof jQuery && $form.length > 0) {
            var $failed = $form.find("input[data-validator]:visible").filter(function () {
                return _validate(this);
            });
            return $failed;
        }
        return $();
    }

    function _validate(element){
        var result=true;
        var needInvalidEvent=false;
        var $this = $(element);
        if (element.checkValidity){
            result&=element.checkValidity();
        }
        if (result){//it's still treu,so we need to emit invalid event
            needInvalidEvent=true
        }
        var validator=$this.data('validator');
        switch (validator) {
            case "email":
                result&=/^[a-zA-Z0-9\._%\+-]+@[a-zA-Z0-9\.-]+\.[a-zA-Z]{2,6}$/.test($this.val());
                break;
            case "digits":
                result&=/^[\d]+$/.test($this.val());
                break;
            case "yes":
                result&=$this.val().length>0;
                break;
            default:
                break;
        }
        if (needInvalidEvent && !result){
            $this.trigger("invalid",{validator:validator});
        }
        return !result;
    }

    function _showFailedAlert($failed,noScroll){
        if ($failed instanceof jQuery && $failed.length > 0) {
            $failed.each(function () {
                var $this=$(this);
                var $valdata = $this.data("validator.elements");
                if ($valdata != null && $valdata instanceof jQuery) {
                    $valdata.show();
                    $this.addClass(settings.errorFieldClass);
                    $this.one("keypress", function (e) {
                        $valdata.hide();
                        $this.removeClass(settings.errorFieldClass);
                    });
                }
            });
            if (!noScroll){
                $('body').animate({scrollTop:($failed.first().offset().top-Math.max(document.documentElement.clientHeight, window.innerHeight || 0)/2)+'px'},150);
            }
        }
        return $failed;
    }
    function _bind($forms,event){
        if ($forms instanceof jQuery && $forms.length > 0) {
            $forms.on("submit", function (e) {
                var $form = $(this);
                var $failed=_findFailedFields($form);
                if ($failed.length > 0) {
                    _showFailedAlert($failed);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
            }).on(event,"input[data-validator]",function(e){
                setTimeout(function(){
                    if (_validate(e.currentTarget)){_showFailedAlert($(e.currentTarget),true);}
                },150);
            });

        }
        return $forms;
    }
    function validate(selector){
        return _showFailedAlert(_findFailedFields(_getFormsWithValidator(selector))).length<1;
    }
    function inject(selector,event){
        return _bind(_getFormsWithValidator(selector),event);
    }
    function applyValidationResult(selector,json){
        if (json instanceof Object){
                $form=_getForms(selector);
                if ($form.length>0){
                    $form=$form.first();
                    var $failed= $form.find("[name]").filter(function(){
                        if (this.name in json){
                            $this=$(this);
                            var $valdata = $this.data("validator.elements");
                            if (!$valdata){
                                $this.data("validator.elements", _getValidatorElements($this));
                                $valdata = $this.data("validator.elements");
                            }
                            if ($valdata instanceof jQuery){
                                $valdata.text(json[this.name]);
                            }else{
                                console.error("Can't get [message_text] jQ object on the ["+this.name+"] field to fill with a validation message");
                            }
                            return true;
                        }
                    });
                    _showFailedAlert($failed);
                    return $failed.length<1;
                }
        }
        return true;
    }

    if (!_checkJQ(true)) throw new ReferenceError("FormValidator requires jQuery to be available");
    $.extend(settings,options);
    var instance={
        validate:validate,
        inject:inject,
        applyValidationResult:applyValidationResult
    }
    return instance;
};
