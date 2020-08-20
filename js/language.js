/* class Language{
    constructor(lng){
        //parameter for the language
        this.lng = lng;
        // Define arrays how many language you want to translate
        //ISO 2 Letter Language Codes
        var es = new Array("welcome","title","instructions"); //spanish
        var en = new Array("welcome","title","instructions"); //english
        var pt = new Array("welcome","title","instructions"); //portuguese
    };
    // caption tag name
    //es['welcome'] = "Bienvenidos"; 
    //en['welcome'] = "Welcome";
    //pt['welcome'] = "Bem-vinda";
    //instructions
    //es['instructions'] = "Instrucciones en español"; 
    //en['instructions'] = "English set of instructions";
    //pt['instructions'] = "Eu falo portuguese";

    // Added new array defined arrays.
    var resources = new Array();
    resources['es'] = sp;
    resources['en'] = en;
    resources['pt'] = pt;

    changeLanguage()
    {
        resources = getLangResources()[this.lng];
        $("a[name='translate']").each(function(i, elt)
        {
            $(elt).text(resources[$(elt).attr("caption")]);
        });
    };
    
    return resources;
}
*/
