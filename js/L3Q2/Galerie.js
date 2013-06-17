function Galerie (urlFile){
	var rooms = [];
	var urlmodel = urlFile;
	
	this.getUrlmodel = function(){ return (urlmodel); };
	this.getRooms = function(){ return (rooms); };
	this.getRoom = function(iDRoom){ return (rooms[iDRoom]) };
}

function Galerie3D (galerie){
	var galerie;
	var render;
	var scene;
	var controls;
	var clock = new THREE.Clock();
	var projector;
	var timerSalle;
	var self = this;
	var queue = new AsyncQueue({name : 'loadCollada'});
	/**
	* \brief initialisation des éléments
	* \details
	*/
	this.init = function (){

		//camera
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1 , 20000);
		//controls
		controls = new THREE.FirstPersonControls( camera , galerie );
		controls.movementSpeed = 50;
		controls.lookSpeed = 0.1;
		controls.lookVertical = false;
		controls.noFly = true;
		//scene
		scene = new THREE.Scene();
		scene.add(camera);
		//renderer
		renderer = new THREE.WebGLRenderer({
			antialias : true
		});
		renderer.setSize( window.innerWidth, window.innerHeight-(9*window.innerHeight)/100 );
		$('#container').append( renderer.domElement );
		//event
		$(window).resize(onWindowResize);
		$(document).mousedown(onDocumentMouseDown);
		//Light
		ambientLight = new THREE.AmbientLight( 0xffffff );
    	//scene.add( ambientLight );
    	pointLight = new THREE.PointLight( 0xffffff );
    	pointLight.intensity = 0.5;
    	pointLight.position.y = 10000;
    	scene.add( pointLight );
    	directionalLight = new THREE.DirectionalLight( 0xffffff );
    	directionalLight.intensity = 0.1;
    	directionalLight.position.x = 100;
    	directionalLight.position.y = 10000;
    	directionalLight.position.z = 1;
    	directionalLight.position.normalize();
    	scene.add( directionalLight );
    	//Collada Import
    	this.chargerGalerie();
		camera.position.set(-1,0,87);
		//Ajout des objets dans la scene
		projector = new THREE.Projector();
		//timer
		timerSalle= window.setInterval(function(){ self.MAJTempsSalle();},1000);
	
	}

	/**
	* \brief permet de charger la galerie et de l'ajouter à la scène
	* \details pour charger la salle on charge le fichier collada à partir de l'url de la galerie, on obtient ensuite la scène contenu dans le fichier collada. Pour chaque salle on parcourt les "children" de la scène importer et on ajoute les objets contenant le nom de la salle suivi de "_floor" ,"_roof","_wall",ou "windowBorder". Si la salle est de type salle d'exposition on ajoute alors à la scène les objets contenant le nom de la salle suivi de "_end_segment","_middle_segment",ou "beginning_segment" suivi de "_floor" ,"_roof","_wall",ou "windowBorder". La taille d'une salle s'adapte par rapport aux nombres d'objet qu'elle possède.
	* 
	* 
	*/
	this.chargerGalerie = function(){
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		var scaleValue = 10;

		loader.load( galerie.getUrlmodel() ,function( collada ){
			var cloneObject;
			var model = collada.scene;
			for(var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
				if(galerie.getRoom(iDRoom) instanceof Room){
					for(var i=0 ; i<model.children.length ; i++){
						cloneObject = model.children[i].clone();
						cloneObject.scale.set(scaleValue,scaleValue,scaleValue);
						switch(model.children[i].name){
							case galerie.getRoom(iDRoom).getRoomName()+"_floor":
							case galerie.getRoom(iDRoom).getRoomName()+"_roof":
							case galerie.getRoom(iDRoom).getRoomName()+"_wall":
							case galerie.getRoom(iDRoom).getRoomName()+"_windowBorder":
							scene.add(cloneObject);
							break;
						}
					}
				}
				if(galerie.getRoom(iDRoom) instanceof ShowRoom){
					for(var i=0 ; i<model.children.length ; i++){
						cloneObject = model.children[i].clone();
						cloneObject.scale.set(scaleValue,scaleValue,scaleValue);
						switch(model.children[i].name){
							case galerie.getRoom(iDRoom).getRoomName()+"_end_segment_floor":
							case galerie.getRoom(iDRoom).getRoomName()+"_end_segment_roof":
							case galerie.getRoom(iDRoom).getRoomName()+"_end_segment_wall":
							case galerie.getRoom(iDRoom).getRoomName()+"_end_segment_windowBorder":
							cloneObject.position.z -= galerie.getRoom(iDRoom).getTailleExtension()*galerie.getRoom(iDRoom).getNbExtension();
							scene.add(cloneObject.clone());
							break;
							case galerie.getRoom(iDRoom).getRoomName()+"_middle_segment_floor":
							case galerie.getRoom(iDRoom).getRoomName()+"_middle_segment_roof":
							case galerie.getRoom(iDRoom).getRoomName()+"_middle_segment_wall":
							case galerie.getRoom(iDRoom).getRoomName()+"_middle_segment_windowBorder":
							scene.add(cloneObject.clone());
							for(var idExtension = 0 ; idExtension < galerie.getRoom(iDRoom).getNbExtension() ; idExtension++){
								cloneObject.position.z -= galerie.getRoom(iDRoom).getTailleExtension();
								scene.add(cloneObject.clone());
							}
							break;
							case galerie.getRoom(iDRoom).getRoomName()+"_beginning_segment_floor":
							case galerie.getRoom(iDRoom).getRoomName()+"_beginning_segment_roof":
							case galerie.getRoom(iDRoom).getRoomName()+"_beginning_segment_wall":
							case galerie.getRoom(iDRoom).getRoomName()+"_beginning_segment_windowBorder":
							scene.add(cloneObject);
							break;
						}
					}
				}
			}
		});
	};

	/**
	* \brief Met à jour le temps dans une salle d'exposition
	* \details si la caméra est dans une salle d'exposition alors on incrémente la valeur de son temps
	* 
	* 
	*/
	this.MAJTempsSalle = function(){
		for(var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
			if(galerie.getRoom(iDRoom) instanceof ShowRoom){
				if(camera.position.x < galerie.getRoom(iDRoom).getArea().getXMax() 
					&& camera.position.x > galerie.getRoom(iDRoom).getArea().getXMin()
					&& camera.position.z < galerie.getRoom(iDRoom).getArea().getZMax()
					&& camera.position.z > galerie.getRoom(iDRoom).getArea().getZMin() - galerie.getRoom(iDRoom).getTailleExtension() * galerie.getRoom(iDRoom).getNbExtension() ){
					galerie.getRoom(iDRoom).incrementTime();
					//console.log('Temps dans la '+galerie.getRoom(iDRoom).getRoomName()+' : '+galerie.getRoom(iDRoom).getTime()+'sec');
				}
			}
		}
	};


	/**
	* \brief Permet de ajouter les objets d'une salle
	* \details les objets sont charger et sont ensuite ajouter à la scène, on charge l'objet selon son type (peinture ou sculpture) et par le nom du model
	* 
	* \param room Room est la salle ou on va charger les objets
	* \param ecartObjet represente l'ecart entre les objets sur l'axe Z
	* \param ecartMur represente l'ecart entre les objets et le mur sur l'axe X
	* \param scale represente la valeur de l'echelle qu'on souhaite donner à l'objet
	* \param hauteur represente la valeur de la position de l'objet sur l'axe Y
	*/
	this.chargerObjet = function( room, ecartObjet, ecartMur , scale, hauteur){
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		var scaleValue = scale;
		var positionXGauche = room.getArea().getXMin() + ecartMur;
		var positionXDroite = room.getArea().getXMax() - ecartMur;
		var positionZGauche = 15;
		var positionZDroite = 15;
		var cloneObject;
		var indiceObjet = 1;
		for( var i = 0 ; i < room.getArtworks().length ;  i++){
			console.log(room.getArtwork(i).getModel3D());
			if(i%2 == 0){
				loader.load( room.getArtwork(i).getModel3D(), function(collada){
					queue.push({
					fn : function(collada) {
						console.log(indiceObjet);
						console.log(room.getArtwork(indiceObjet-1).getId());
						var model = collada.scene;
						for( var j = 0 ; j < model.children.length ; j ++){
							if( model.children[j] instanceof THREE.Mesh ){
								model.children[j].useQuaternion = false;
								model.children[j].rotation.set( Math.PI/2, Math.PI/2, -	Math.PI/2);
								model.children[j].scale.set( scaleValue , scaleValue , scaleValue );
								model.children[j].position.set( positionXGauche , hauteur , positionZGauche );
								model.children[j].name = room.getArtwork(indiceObjet-1).getId();
								//console.log(indiceObjet);
								//console.log(model.children[j].name);
								scene.add(model.children[j].clone());
							}
						}
						positionZGauche -= ecartObjet;
						indiceObjet += 1;
						},
						args: [collada]
					});
				});
			}else{	
				loader.load( room.getArtworks()[i].getModel3D(), function(collada){
					queue.push({
						fn : function(collada){

							console.log(indiceObjet);
							console.log(room.getArtwork(indiceObjet-1).getId());
							var model = collada.scene;
							for( var j = 0 ; j < model.children.length ; j++){
								if(model.children[j] instanceof THREE.Mesh){
									model.children[j].useQuaternion = false;
									model.children[j].rotation.set( Math.PI/2, -Math.PI/2, Math.PI/2);
									model.children[j].scale.set( scaleValue , scaleValue , scaleValue );
									model.children[j].position.set( positionXDroite , hauteur , positionZDroite );
									model.children[j].name = room.getArtwork(indiceObjet-1).getId();
									//console.log(indiceObjet);
									//console.log(model.children[j].name);
									scene.add(model.children[j].clone());
								}
							}
							positionZDroite -= ecartObjet;
							indiceObjet += 1;
						},
						args : [collada]
					});
				});
			}
		}
	};

	/**
	* \brief Detecte si le clic est sur l'un des objet de la salle et si oui affiche des informations sur l'objet
	* \details Pour savoir si on clic sur un objet de la galerie , on projete un "raycaster" ,et si on intercepte plus d'un objet, on vérifie alors que le nom du premier objet intercepté est une oeuvre d'art. Si oui alors on affiche les informations dans le containerInfo 
	*  
	*/
	function onDocumentMouseDown(event){
		event.preventDefault();
		var vector = new THREE.Vector3( (event.clientX / window.innerWidth ) * 2 - 1, -(event.clientY / window.innerHeight ) * 2 + 1, 1);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(scene.children);
		if ( intersects.length > 0 ) {
			for( var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
				if(galerie.getRoom(iDRoom) instanceof ShowRoom){
					for( var i = 0 ; i < galerie.getRoom(iDRoom).getArtworks().length ; i++ ){
						console.log(intersects[0].object.name);
						if( galerie.getRoom(iDRoom).getArtwork(i).getId() == intersects[0].object.name ){
							console.log("ding");
							$('#containerInfo').css('visibility','visible');
							$('#info').empty();
							$('#info').append('<p>Nom : '+galerie.getRoom(iDRoom).getArtwork(i).getId()+'');
							/*$('#info').append('<br>Artiste : '+galerie.getRoom(iDRoom).getArtwork(i).getAuteur()+'');
							$('#info').append('<br>Dimension : '+galerie.getRoom(iDRoom).getArtwork(i).getDimension()+'');*/
							$('#info').append('<br>Lien : <a href="'+galerie.getRoom(iDRoom).getArtwork(i).getLink()+'"target="_blank">Lien boutique</a> </p>');
						}
					}
				}
			}
		}
	}

	/**
	* \brief Detecte si la caméra est en dehors des salles
	* \details 
	* 
	* \return \e false si la caméra est dans une des salles
	* \return \e true si la caméra est en dehors des salles 
	*/
	this.detecteCollision = function (){
		for( var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
			if( galerie.getRoom(iDRoom) instanceof ShowRoom){
				if( camera.position.x < galerie.getRoom(iDRoom).getArea().getXMax()
				&& camera.position.x > galerie.getRoom(iDRoom).getArea().getXMin()
				&& camera.position.z < galerie.getRoom(iDRoom).getArea().getZMax()
				&& camera.position.z > galerie.getRoom(iDRoom).getArea().getZMin()-galerie.getRoom(iDRoom).getTailleExtension()*galerie.getRoom(iDRoom).getNbExtension())
				return false;
			}
			if( galerie.getRoom(iDRoom) instanceof Room){
				if( camera.position.x < galerie.getRoom(iDRoom).getArea().getXMax()
				&& camera.position.x > galerie.getRoom(iDRoom).getArea().getXMin()
				&& camera.position.z < galerie.getRoom(iDRoom).getArea().getZMax()
				&& camera.position.z > galerie.getRoom(iDRoom).getArea().getZMin())
				return false;
			}
		}
		return true;
	}

	/**
	* \brief Met à jour les variables qui sont lié avec la dimension de la fenêtre
	* \details
	*/
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();		
		renderer.setSize( window.innerWidth, window.innerHeight-(9*window.innerHeight)/100 );
		controls.handleResize();
		render();

	}

	/**
	* \brief permet d'animer l'affichage
	* \details
	*/
	this.animate = function() {
		requestAnimationFrame( animate );
		render();
	}

	/**
	* \brief permet d'animer l'affichage
	* \details
	*/
	function animate(){
		requestAnimationFrame( animate );
		render();
	}

	/**
	* \brief permet d'afficher le rendu
	* \details
	*/
	function render() {
		controls.update(clock.getDelta());
		renderer.render( scene, camera );
	}
}


function Room (name, area){
	var roomName = name;
	var area;

	this.getRoomName = function(){ return (roomName); }
	this.getArea = function(){ return (area); }
}

function Area(Xmin, Xmax, Zmin, Zmax){
	var xMin = Xmin;
	var xMax = Xmax;
	var zMin = Zmin;
	var zMax = Zmax;

	this.getXMin = function(){ return (xMin); }
	this.getXMax = function(){ return (xMax); }
	this.getZMin = function(){ return (zMin); }
	this.getZMax = function(){ return (zMax); }

}

function ShowRoom(name, area, tailleExtension, nbObjetAjouterParExtension, nbObjetMaxSansExtension){
	Room.call(this,name,area);
	var artworks = [];
	var time = 0;
	var tailleExtension;
	var nbExtension = 0;
	var nbObjetMaxSansExtension;
	var nbObjetAjouterParExtension;

	this.getArtworks = function(){ return (artworks); }
	this.getArtwork = function(iDArtwork){ return artworks[iDArtwork] }
	this.getTime = function(){ return (time) }
	this.getNbExtension = function(){ return (nbExtension) }
	this.getTailleExtension = function(){ return (tailleExtension) }
	this.getNbObjetMaxSansExtension = function(){ return (nbObjetMaxSansExtension) }
	this.getNbObjetAjouterParExtension = function(){ return (nbObjetAjouterParExtension) }

	/**
	* \brief Incrémentation de 1 de la variable time
	*/
	this.incrementTime = function(){ 
		time += 1 
	};

	/**
	* \brief ajout d'une oeuvre d'art dans le tableau et met à jour la varaible nbExtension
	*/
	this.addArtwork = function(artwork){
		artworks.push(artwork);
		nbExtension = calculerNbExtension();
	};
	
	/*
	* \brief calcule le nombre d'extension
	* \details Calcule le nombre d'extension par rapport aux nombre d'objet maximum sans extension , le nombre d'objet ajouter par extension et le nombre d'objet dans la salle
	*
	* \return \e 0 si le nombre d'objet dans une salle est inférieur aux nombres d'objet maximum dans une salle sans extension
	* \return sinon retourne une valeur entière >= 1;
	*/
	function calculerNbExtension(){
		if(artworks.length > nbObjetMaxSansExtension){
			return Math.floor( (artworks.length-nbObjetMaxSansExtension)/nbObjetAjouterParExtension + (artworks.length-nbObjetMaxSansExtension)%nbObjetAjouterParExtension);
		}else{
			return 0;
		}
	}	
}


function Artwork(id, type, dimension, auteur, model3D, link){
	var id ;
	var type ; //Sculture ou Peinture
	var dimension ;
	var auteur ;
	var model3D ;
	var link ; //Lien vers le site e-commerce

	this.getId = function(){ return (id); }
	this.getType = function(){ return (type); }
	this.getDimension = function(){ return (dimension); }
	this.getAuteur = function(){ return (auteur); }
	this.getModel3D = function(){ return (model3D); }
	this.getLink = function(){ return (link); }
}

