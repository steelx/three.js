/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneExporter = function () {};

THREE.SceneExporter.prototype = {

	constructor: THREE.SceneExporter,

	parse: function ( scene ) {

		var position = Vector3String( scene.position );
		var rotation = Vector3String( scene.rotation );
		var scale = Vector3String( scene.scale );

		// todo: extract all scene elements

		var nobjects = 0;
		var ngeometries = 0;
		var nmaterials = 0;
		var ntextures = 0;

		var objectsArray = [];
		var geometriesArray = [];
		var materialsArray = [];

		var geometriesMap = {};
		var materialsMap = {};

		// todo: make object creation properly recursive

		scene.traverse( function ( node ) {

			if ( node instanceof THREE.Mesh ) {

				objectsArray.push( ObjectString( node ) );
				nobjects += 1;

				if ( ! ( node.geometry.id in geometriesMap ) ) {

					geometriesMap[ node.geometry.id ] = true;
					geometriesArray.push( GeometryString( node.geometry ) );
					ngeometries += 1;

				}

				if ( ! ( node.material.id in materialsMap ) ) {

					materialsMap[ node.material.id ] = true;
					materialsArray.push( MaterialString( node.material ) );
					nmaterials += 1;

				}

			}

		} );

		var objects = generateMultiLineString( objectsArray, ",\n\n\t" );
		var geometries = generateMultiLineString( geometriesArray, ",\n\n\t" );
		var materials = generateMultiLineString( materialsArray, ",\n\n\t" );

		var textures = "";
		var cameras = "";
		var lights = "";

		// todo: get somehow these from Viewport's renderer

		var bgcolor = ColorString( new THREE.Color( 0xaaaaaa ) );
		var bgalpha = 1.0;
		var defcamera = LabelString( "default_camera" );

		//

		function Vector3String( v ) {

			return "[" + v.x + "," + v.y + "," + v.z + "]";

		}

		function ColorString( c ) {

			return "[" + c.r.toFixed( 3 ) + "," + c.g.toFixed( 3 ) + "," + c.b.toFixed( 3 ) + "]";

		}

		function LabelString( s ) {

			return '"' + s + '"';

		}

		//

		function ObjectString( o ) {

			var output = [

			'\t' + LabelString( getObjectName( o ) ) + ' : {',
			'	"geometry" : '   + LabelString( getGeometryName( o.geometry ) ) + ',',
			'	"materials": [ ' + LabelString( getMaterialName( o.material ) ) + ' ],',
			'	"position" : ' + Vector3String( o.position ) + ',',
			'	"rotation" : ' + Vector3String( o.rotation ) + ',',
			'	"scale"	   : ' + Vector3String( o.scale ) + ',',
			'	"visible"  : ' + o.visible,
			'}'

			];

			return output.join( '\n\t\t' );

		}

		function GeometryString( g ) {

			if ( g instanceof THREE.SphereGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "sphere",',
				'	"radius"  : ' 		 + g.radius + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				];

			} else if ( g instanceof THREE.CubeGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "cube",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"depth"  : '  + g.depth  + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'	"depthSegments" : '  + g.depthSegments + ',',
				'}',

				];

			} else if ( g instanceof THREE.PlaneGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "plane",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				];

			} else {

				var output = [];

			}

			return generateMultiLineString( output, '\n\t\t' );

		}

		function MaterialString( m ) {

			if ( m instanceof THREE.MeshBasicMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshBasicMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',

				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];


			} else if ( m instanceof THREE.MeshLambertMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshLambertMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
				'		"ambient"  : ' 	+ m.ambient.getHex() + ',',
				'		"emissive"  : ' + m.emissive.getHex() + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',

				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshPhongMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshPhongMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
				'		"ambient"  : ' 	+ m.ambient.getHex() + ',',
				'		"emissive"  : ' + m.emissive.getHex() + ',',
				'		"specular"  : ' + m.specular.getHex() + ',',
				'		"shininess" : ' + m.shininess + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',
				m.normalMap ? 	'		"normalMap" : ' + LabelString( getTextureName( m.normalMap ) ) + ',' : '',
				m.bumpMap ? 	'		"bumpMap" : ' + LabelString( getTextureName( m.bumpMap ) ) + ',' : '',

				'		"bumpScale"  : ' + m.bumpScale + ',',
				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshDepthMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshDepthMaterial",',
				'	"parameters"  : {',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshNormalMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshNormalMaterial",',
				'	"parameters"  : {',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshFaceMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshFaceMaterial",',
				'	"parameters"  : {}',
				'}',

				];

			}

			return generateMultiLineString( output, '\n\t\t' );

		}

		function generateMultiLineString( lines, separator ) {

			var cleanLines = [];

			for ( var i = 0; i < lines.length; i ++ ) {

				if ( lines[ i ] ) cleanLines.push( lines[ i ] );

			}

			return cleanLines.join( separator );

		}

		function getObjectName( o ) {

			return o.name ? o.name : "Object_" + o.id;

		}

		function getGeometryName( g ) {

			return g.name ? g.name : "Geometry_" + g.id;

		}

		function getMaterialName( m ) {

			return m.name ? m.name : "Material_" + m.id;

		}

		function getTextureName( t ) {

			return t.name ? t.name : "Texture_" + t.id;

		}

		//

		var output = [
			'{',
			'	"metadata": {',
			'		"formatVersion" : 3.1,',
			'		"type"		: "scene",',
			'		"generatedBy"	: "SceneExporter",',
			'		"objects"       : ' + nobjects + ',',
			'		"geometries"    : ' + ngeometries + ',',
			'		"materials"     : ' + nmaterials + ',',
			'		"textures"      : ' + ntextures,
			'	},',
			'',
			'	"urlBaseType": "relativeToScene",',
			'',

			'	"objects" :',
			'	{',
			'\t' + objects,
			'	},',
			'',

			'	"geometries" :',
			'	{',
			'\t' + 	geometries,
			'	},',
			'',

			'	"materials" :',
			'	{',
			'\t' + 	materials,
			'	},',
			'',

			'	"textures" :',
			'	{',
			'\t' + 	textures,
			'	},',
			'',

			'	"cameras" :',
			'	{',
			'\t' + 	cameras,
			'	},',
			'',

			'	"lights" :',
			'	{',
			'\t' + 	lights,
			'	},',
			'',

			'	"transform" :',
			'	{',
			'		"position"  : ' + position + ',',
			'		"rotation"  : ' + rotation + ',',
			'		"scale"     : ' + scale,
			'	},',
			'',
			'	"defaults" :',
			'	{',
			'		"bgcolor" : ' + bgcolor + ',',
			'		"bgalpha" : ' + bgalpha + ',',
			'		"camera"  : ' + defcamera,
			'	}',
			'}'
		].join( '\n' );

		return output;

	}

}