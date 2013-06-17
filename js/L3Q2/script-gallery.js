$(function() {
    alert('bouh');
    var galerie = new Galerie("/bundles/l3q2gallery/models/galerie/GalerieV4.dae");
    var receptionRoom = new Room("receptionRoom",new Area(-30,82,50.5,90));
    var sculptureRoom = new ShowRoom("showRoom_sculpture",new Area(26.7,78,-55,50.5),29.9,2,6);
    var paintingRoom = new ShowRoom("showRoom_painting",new Area(-27,17,-101,50.5),44.9,2,6);
    galerie.getRooms().push(receptionRoom,sculptureRoom,paintingRoom);
    var nbSculpture = 29;
    var nbPeinture = 0;
    var galerie3D = new Galerie3D(galerie);
    for(var i = 0 ; i < nbSculpture ; i++){
        galerie.getRoom(1).addArtwork(new Artwork("sculpture "+(i+1),"sculpture","20x20","inconnue","/bundles/l3q2gallery/models/sculpture/Monkey.dae","#"));
    }
    for(var i = 0 ; i < nbPeinture ; i++){
        galerie.getRoom(2).addArtwork(new Artwork("peinture "+(i+1),"peinture","30x30","inconnue","","#"));
    }
    
    galerie3D.init();
    galerie3D.chargerObjet( galerie.getRoom(1) , 30 , 3 , 5 , 1 );
    galerie3D.animate();
});