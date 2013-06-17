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
            	directionalLight.intensity = 0.5;
            	directionalLight.position.x = 1;
            	directionalLight.position.y = -1;
            	directionalLight.position.z = -1;
            	directionalLight.position.normalize();
            	scene.add( directionalLight );
            	//Collada Import
            	this.chargerGalerie();
            	//this.chargerObjet(galerie.getRoom(1),30,3,5,1);
				camera.position.set(-1,0,87);
				//Ajout des objets dans la scene
				projector = new THREE.Projector();
				//timer
				timerSalle= window.setInterval(function(){ self.MAJTempsSalle();},1000);
			
			}

	this.chargerGalerie = function(){
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		var scaleValue = 10;

		loader.load( galerie.getUrlmodel() ,function( collada ){
			var cloneObject;
			var model = collada.scene;
			/*
				on parcourt tout les "children" de la scene
				on ajoute ensuite les élements qui nous interesse
				on les identifie à partir de leur nom
			*/
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

	this.MAJTempsSalle = function(){
		for(var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
			if(galerie.getRoom(iDRoom) instanceof ShowRoom){
				if(camera.position.x < galerie.getRoom(iDRoom).getArea().getXMax() 
					&& camera.position.x > galerie.getRoom(iDRoom).getArea().getXMin()
					&& camera.position.z < galerie.getRoom(iDRoom).getArea().getZMax()
					&& camera.position.z > galerie.getRoom(iDRoom).getArea().getZMin() - galerie.getRoom(iDRoom).getTailleExtension() * galerie.getRoom(iDRoom).getNbExtension() ){
					galerie.getRoom(iDRoom).incrementTime();
					console.log('Temps dans la '+galerie.getRoom(iDRoom).getRoomName()+' : '+galerie.getRoom(iDRoom).getTime()+'sec');
				}
			}
		}
	};

	this.chargerObjet = function( room, ecartObjet, ecartMur , scale, hauteur){
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		var scaleValue = scale;
		var positionXGauche = room.getArea().getXMin() + ecartMur;
		var positionXDroite = room.getArea().getXMax() - ecartMur;
		var positionZGauche = 15;
		var positionZDroite = 15;
		var cloneObject;
		for( var i = 0 ; i < room.getArtworks().length ;  i++){
			var indiceSculpture = 1;
			//les sculptures sont charger une fois à gauche et la suivante a droite
			//false a useQuaternion pour que l'objet importer ne garde pas sa rotation d'origine
			//on ajoute a la scene juste les composants de la scene qui sont de type THREE.Mesh
			if(i%2 == 0){
				loader.load( "models/"+room.getArtwork(i).getType()+"/"+room.getArtwork(i).getModel3D(), function(collada){
					var model = collada.scene;
					for( var j = 0 ; j < model.children.length ; j ++){
						if( model.children[j] instanceof THREE.Mesh ){
							model.children[j].useQuaternion = false;
							model.children[j].rotation.set( Math.PI/2, 0, -	Math.PI/2);
							model.children[j].scale.set( scaleValue , scaleValue , scaleValue );
							model.children[j].position.set( positionXGauche , hauteur , positionZGauche );
							model.children[j].name = "sculpture "+indiceSculpture;
							scene.add(model.children[j].clone());
						}
					}

					positionZGauche -= ecartObjet;
					indiceSculpture += 1;
				});
			}else{
				loader.load( "models/"+room.getArtwork(i).getType()+"/"+room.getArtworks()[i].getModel3D(), function(collada){
					var model = collada.scene;
					for( var j = 0 ; j < model.children.length ; j++){
						if(model.children[j] instanceof THREE.Mesh){
							model.children[j].useQuaternion = false;
							model.children[j].rotation.set( Math.PI/2, 0, Math.PI/2);
							model.children[j].scale.set( scaleValue , scaleValue , scaleValue );
							model.children[j].position.set( positionXDroite , hauteur , positionZDroite );
							model.children[j].name = "sculpture "+indiceSculpture;
							scene.add(model.children[j].clone());
						}
					}

					positionZDroite -= ecartObjet;
					indiceSculpture += 1;
				});
			}
		}
	};

	function onDocumentMouseDown(event){
		event.preventDefault();
		var vector = new THREE.Vector3( (event.clientX / window.innerWidth ) * 2 - 1, -(event.clientY / window.innerHeight ) * 2 + 1, 1);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(scene.children);
		//si le raycaster à des intersection avec un objet 
		//alors on vérifie si le premier objet de l'intersection correspond à une Sculpture ou à une peinture
		//si c'est une peinture alors on affiche les informations de l'objet
		if ( intersects.length > 0 ) {
			for( var iDRoom = 0 ; iDRoom < galerie.getRooms().length ; iDRoom++){
				if(galerie.getRoom(iDRoom) instanceof ShowRoom){
					for( var i = 0 ; i < galerie.getRoom(iDRoom).getArtworks().length ; i++ ){
						if( galerie.getRoom(iDRoom).getArtwork(i).getId() == intersects[0].object.name ){
							console.log("ding");
							$('#containerInfo').css('visibility','visible');
							$('#info').empty();
							$('#info').append('<p>Nom : '+galerie.getRoom(iDRoom).getArtwork(i).getId()+'');
							$('#info').append('<br>Artiste : '+galerie.getRoom(iDRoom).getArtwork(i).getAuteur()+'');
							$('#info').append('<br>Dimension : '+galerie.getRoom(iDRoom).getArtwork(i).getDimension()+'');
							$('#info').append('<br>Lien : <a href="'+galerie.getRoom(iDRoom).getArtwork(i).getLink()+'">details</a> </p>');
						}
					}
				}
			}
		}
	}

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

	//redimensionne lors d'un changement de la taille de la fenêtre
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();		
		renderer.setSize( window.innerWidth, window.innerHeight-(9*window.innerHeight)/100 );
		controls.handleResize();
		render();

	}

	//Mise à jour de l'affichage
	this.animate = function() {
		requestAnimationFrame( animate );
		render();
	}

	function animate(){
		requestAnimationFrame( animate );
		render();
	}

	function render() {
		controls.update(clock.getDelta());
		renderer.render( scene, camera );
	}
}


function Room (name,area){
	var roomName = name;
	var area;

	this.getRoomName = function(){ return (roomName); }
	this.getArea = function(){ return (area); }
}

function Area(Xmin,Xmax,Zmin,Zmax){
	var xMin = Xmin;
	var xMax = Xmax;
	var zMin = Zmin;
	var zMax = Zmax;

	this.getXMin = function(){ return (xMin); }
	this.getXMax = function(){ return (xMax); }
	this.getZMin = function(){ return (zMin); }
	this.getZMax = function(){ return (zMax); }

}

function ShowRoom(name,area,tailleExtension,nbObjetAjouterParExtension,nbObjetMaxSansExtension){
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

	/*
	* fonction qui incrémente de 1 le temps
	*/
	this.incrementTime = function(){ 
		time += 1 
	};

	/*
	* fonction qui rajoute une oeuvre d'art dans la tableau
	* elle met à jour le nombre d'extension en appelant la fonction calculerNbExtension
	*/
	this.addArtwork = function(artwork){
		artworks.push(artwork);
		nbExtension = calculerNbExtension();
	};
	
	/*
	* fonction qui retourne le nombre d'extension par rapport 
	* aux nombres d'objets,
	* le nombre d'objet dans une salle sans extension,
	* et le nombre d'objet par extension
	*/
	function calculerNbExtension(){
		if(artworks.length > nbObjetMaxSansExtension){
			return Math.floor( (artworks.length-nbObjetMaxSansExtension)/nbObjetAjouterParExtension + (artworks.length-nbObjetMaxSansExtension)%nbObjetAjouterParExtension);
		}else{
			return 0;
		}
	}	
}


function Artwork(id,type,dimension,auteur,model3D,link){
	var id ;
	var type ;
	var dimension ;
	var auteur ;
	var model3D ;
	var link ;

	this.getId = function(){ return (id); }
	this.getType = function(){ return (type); }
	this.getDimension = function(){ return (dimension); }
	this.getAuteur = function(){ return (auteur); }
	this.getModel3D = function(){ return (model3D); }
	this.getLink = function(){ return (link); }
}

