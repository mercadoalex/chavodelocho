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


class Board
{   constructor(x,y){
        this.x = x;    
        this.y = y;
    }
    createGrid(){
        for (let i = 1; i < this.x; i++) {
            for (let j = 1; j < this.y; j++) {
                $('#gameBoard').append(`<div class="square" data-rows=${i} data-columns=${j}></div>`)
        }}
    };
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}
const items = [{
        name: 'donramon',
        power: 10,
        img: ''
    }, {
        name: 'torta',
        power: 20,
        img: ''
    }, {
        name: 'supertorta',
        power: 30,
        img: ''
    }, {
        name: 'resortera',
        power: 40,
        img: ''
}, {
        name: 'barrel',
        power: 0,
        img: ''
}];
const player = [{
    name: 'player1',
    lifepoint: 100,
    weapon: {
        name: 'weapon',
        power: 10,
        img: ''
    }, location: {
        row: 0,
        column: 0
    }
}, {
    name: 'player2',
    lifepoint: 100,
    weapon: {
        name: 'weapon',
        power: 10,
        img: ''
    }, location: {
        row: 0,
        column: 0
    }
}]

function validateItemplace(item){
        let isOccupied = "";
        let row = randomNumber(1, 9);
        let column = randomNumber(1, 9);
        let selectedSquare = $(`[data-rows=${row}][data-columns=${column}]`);
        isOccupied = selectedSquare.hasClass('occupied');
        if (isOccupied) {
            return validateItemplace(item);
        } else {
            item['location'] = { row: row, column: column }
            selectedSquare.addClass(item['name']).addClass('occupied');
        }
    }

class Item{
    constructor(n){
        this.n = n; 
    }   
    renderItems()
    {
        for (var m = 0; m < this.n; m++) {
            var a = items.length;
            //console.log("longitud del arreglo: " + a);
            //console.log("weapons: " + this.n + " de cada una");
            for (var i = 0; i < items.length; i++) {
                validateItemplace(items[i]);
            }
        }
    } 
    renderPlayers(){
        //var b = player.length;
        //console.log("longitiud de player: " + b);
        for (var p = 0; p < player.length; p++) {
                validateItemplace(player[p]);
            }
    }
}

$(document).ready(function() {
        const board = new Board(10,10);
        board.createGrid();
        const setup = new Item(5);
        setup.renderItems();
        setup.renderPlayers();

        
        // Default Language is English
        //const language = new Language("en");
        //language.changeLanguage();
        // Spanish language button 
        $("#es_button").click(function(){
            language.changeLanguage("es");
            document.getElementById("myAudio").play();
        });
        //English language button
        $("#en_button").click(function(){
            language.changeLanguage("en");
        document.getElementById("myAudio").play();
        });
        //Portugeese language button
        $("#pt_button").click(function(){
            language.changeLanguage("pt");
        document.getElementById("myAudio").play();
        });

});