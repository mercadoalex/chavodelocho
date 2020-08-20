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
    }, {
        name: 'torta',
        power: 20,
        img: ''
    }, {
        name: 'supertorta',
        power: 30,
    }, {
        name: 'resortera',
        power: 40,

}, {
        name: 'barrel',
        power: 0,
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
            //by default player1 starts the game, so we add the class  
                if(player[0]){
                    $(".player1").addClass("activePlayer");
                    //console.log("chavo 8 : jugador activo");    
                }
            }
    }
}

$(document).ready(function() {
        const board = new Board(10,10);
        board.createGrid();
        const setup = new Item(5);
        setup.renderItems();
        setup.renderPlayers();
        const player = new Player("player1");
        player.setMovementRange();

        // Default Language is English
        // Spanish
        $("#es_button").click(function(){
            language.changeLanguage("es");
            document.getElementById("myAudio").play();
        });
        //English
        $("#en_button").click(function(){
            language.changeLanguage("en");
        document.getElementById("myAudio").play();
        });
        //Portuguese
        $("#pt_button").click(function(){
            language.changeLanguage("pt");
        document.getElementById("myAudio").play();
        });

});