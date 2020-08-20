/*  Change active player   */
class Player
{   constructor(player){
        this.name = player; 
        console.log(this.name);
    }
    changeActivePlayer(){
        if(this.name == "player1"){
        activePlayer = player1;
            $(".player2").removeClass("activePlayer");
            $(".player1").addClass("activePlayer"); 
        passivePlayer = player2;
        }else{
            activePlayer = player2;
            $(".player1").removeClass("activePlayer");
            $(".player2").addClass("activePlayer");
            passivePlayer = player1;            
        } 
    };
    getPlayerPosition(){
        let positionx = $(`.${this.name}`).attr( "data-columns");
        let positiony = $(`.${this.name}`).attr( "data-rows");
        return [positionx, positiony];
    };
    setMovementRange(){
        var values = this.getPlayerPosition();
        let posx = parseInt(values[0]); 
        let posy = parseInt(values[1]);    
        console.log("Player position X:" + posx + " Y:" + posy);

        let initialx = posx-3;
        let finalx =  posx+3;
        let initialy = posy-3;
        let finaly = posy+4;
        console.log("Initial X:" + initialx + " Final X: " + finalx);
        console.log("Initial Y:" + initialy + " Final Y: " + finaly);

        //we highlight the squares in X and then Y axis 
        for (var y = initialy; y < finaly; y++){ 
            $(`[data-rows=${y}][data-columns=${posx}]`).addClass('highlighted');
        }
    };
}

function clearhighlightedSquare() {
    return $('.highlighted').removeClass('highlighted');
}
