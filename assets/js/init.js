// Filename: app.js
/*
    This work was supported by a grant from the European Union's 7th Framework Programme (2007-2013)
    provided for the project PublicaMundi (GA no. 609608).
*/

require(['bootstrap', 'notify']);

define([
    'module', 'jquery', 'zoo', 'xml2json', 'ol'
], function(module, $, Zoo, X2JS,ol) {
    
    var zoo = new Zoo({
        url: module.config().url,
        delay: module.config().delay,
    });
    
    var mymodal = $('#myModal');
    var mynotify = $('.top-right');
    

    function notify(text, type) {
        mynotify.notify({
            message: { text: text },
            type: type,
        }).show();
    }


    function setTreeHeight(){
	var theight= $(window).height() - $('.navbar-header').height() -$('.nav-tabs').height() - $('#mmcdts').height() - 30;
	$('.tree-container,.info-container,.sources-container').height(theight);
    }

    function setMapHeight(){
	var mpheight= $(window).height() - $('.navbar-header').height();
	$('#map').height(mpheight);
    }

    function isMobile() {
	try{ document.createEvent("TouchEvent"); return true; }
	catch(e){ return false; }
    }

    var initialize = function() {


	var wm = new WindowManager({
            container: "#windowPane",
            windowTemplate: $('#basic_window_template').html()
	});
	window.wm = wm;
	var basic_counter = 0,
            table_counter = 0,
            form_counter = 0,
            parent_counter = 0,
            child_counter = 0;
	
        wm.createWindow({
	    title: "Basic Window #" + basic_counter,
	    bodyContent: "<p>One fine body...</p>",
	    footerContent: '<button type="button" class="btn btn-default" data-dismiss="window">Close</button><button type="button" class="btn btn-primary">Save changes</button>'
        });



enquire.register("screen and (max-width:980px)", {
    setup : function() {
       setMapHeight();
       setTreeHeight();
    },
    match : function() {
       $('#mmtabs').prepend('<li id="mapwrap" class="active" role="map" data-toggle="tooltip" data-placement="bottom" title="Map"><a href="#mapcontainer" aria-controls="settings" role="tab" data-toggle="tab"><i class="i i-map"></i></a></li>');
       $('.tab-content').prepend('<div role="tabpanel" class="tab-pane" id="mapcontainer"></div>');
       $('.nav-tabs li:eq(2) a').tab('show');
       $('.nav-tabs li:eq(0) a').tab('show');
       $('#map').detach().appendTo('#mapcontainer');
       $('#map').css("position","relative");
       var mnheight= $(window).height() - $('.navbar-header').height() - $('.nav-tabs').height() - $('#mmcdts').height() - 4;      
       $('#map').height(mnheight);

    },
    unmatch : function() {
       $('#map').detach().appendTo('#main');
       $('#mapwrap, #mapcontainer').remove();
       //$('#map').height(mpheight);
       $('#map').css("width","100%");
       $('#map').css({'position':'relative','top' : '0'});
       setMapHeight();
       map.updateSize();
      $('.nav-tabs li:eq(0) a').tab('show');
    }
});

$('#ex1').slider({
       formatter: function(value) {return value + '%';}
});
    
$(".cm").contextmenu({
       target: "#context-menu"
});

$( ".tp, .op" ).click(function() {
       $( "#sidebar-wrapper").toggle();
       $( ".op").toggle();
       $('#map').css("position","relative");
       $("#main-wrapper").toggleClass("fw");
       $(".ol-zoomslider").toggleClass("ol-zsm");
       $(".ol-zoom-extent").toggleClass("ol-zmm");
       $(".ol-zoom").toggleClass("ol-zzm");   
       map.updateSize();
}); 
    
var osm = new ol.layer.Tile({
                source: new ol.source.OSM(),
                name: 'osm'
            });
 
var mapquest = new ol.layer.Tile({
                source: new ol.source.MapQuest({
                    layer: 'osm'
                }),
                name: 'maquest'
            });
    
var controls = [
new ol.control.Attribution(),
new ol.control.MousePosition({
       undefinedHTML: 'outside',
       projection: 'EPSG:4326',
       coordinateFormat: function(coordinate) {
          return ol.coordinate.format(coordinate, '{x}, {y}', 4);
       }
}),
new ol.control.OverviewMap(), 
new ol.control.Rotate({autoHide: false}),
new ol.control.ScaleLine(),
new ol.control.Zoom(),
new ol.control.ZoomSlider(),
new ol.control.ZoomToExtent(),
new ol.control.FullScreen()
];

vector = new ol.layer.Vector({
   title: 'World cities',
   source: new ol.source.GeoJSON({
    url: 'cities.geojson',
    projection: 'EPSG:3857',
       }),
    style: (function() {
    var stroke = new ol.style.Stroke({
    color: 'black'
  });
    var pointStroke = new ol.style.Stroke({
    color: '#fff',
    width: 3
  });
  return function(feature, resolution) {
    return [new ol.style.Style({
    image: new ol.style.Circle({
    radius: 6,
    stroke: pointStroke,
      fill: new ol.style.Fill({color: 'rgba(252,0,0,.8)'})
    }),
      stroke: stroke
    })];
  };
})()
    
});

var map = new ol.Map({
target: "map",
    controls: controls,
          layers: [osm,vector],
          interactions: ol.interaction.defaults({shiftDragZoom: false}) ,
          view: new ol.View({
            center: [0, 0],
            zoom: 2
          })
});

var popup = new ol.Overlay.Popup();
map.addOverlay(popup);
        
map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });
    if (feature) {
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        popup.setPosition(coord);

var coords = ol.coordinate.toStringXY(ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326'),2);

    popup.show(evt.coordinate, '<div><h3>' + feature.get('city')
    +'</h3><p>' + coords +'</p></div>');
    } else {
       popup.hide();
    }
});

map.addInteraction(new ol.interaction.Select({
style: (function() {
 
  return function(feature, resolution) {
    return [new ol.style.Style({
image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                color: '#FF0000'
              }),
              stroke: new ol.style.Stroke({
                color: '#fff',
                width: 5
              }),
              text: new ol.style.Text({
              //text: feature.get('name'),
                font: '15px Verdana,sans-serif',
                fill: '#FFFFFFF',
                stroke:'#333333',
                offsetY: 25
      })
    }),   
  condition: function(e) {
    return e.originalEvent.type=='mousemove';
    }
    })];
  };
})()
})
);

var dragZoom = new ol.interaction.DragZoom({condition: 
ol.events.condition.always}); 
$('.ol-zoombox').on('click', function() {
map.addInteraction(dragZoom); 
});
dragZoom.on('boxend', function(evt) { 
  map.removeInteraction(dragZoom); 
}); 


    }




//    $( ".osmbl" ).click(function() {
  //      map.setBaseLayer(baseOSM);
  //  });

  //  $( ".mqbl" ).click(function() {
  //      map.setBaseLayer(layerLS);
  //  });
    
    var filename="http://127.0.0.1/zoo-requirejs/data/stations.gml";
    function cgalProcessing(aProcess) {
    notify('Running '+aProcess+' service','info');
	zoo.execute({
	    identifier: "cgal."+aProcess,
            dataInputs: [{"identifier":"InputPoints","href":filename,"mimeType":"text/xml"}],
            dataOutputs: [{"identifier":"Result","mimeType":"application/json","type":"raw"}],
            type: 'POST',
            storeExecuteResponse: false,
            success: function(data) {
                notify(aProcess+' service run successfully','success');
		        var GeoJSON = new OpenLayers.Format.GeoJSON();
		        var features = GeoJSON.read((data));
		        layer.removeFeatures(layer.features);
		        layer.addFeatures(features);
            },
            error: function(data) {
		        notify('Execute failed:' +data.ExceptionReport.Exception.ExceptionText, 'danger');
            }
        });
    }


      function applyMargins() {
        var leftToggler = $(".mini-submenu-left");
        if (leftToggler.is(":visible")) {
          $("#map .ol-zoom")
            .css("margin-left", 0)
            .removeClass("zoom-top-opened-sidebar")
            .addClass("zoom-top-collapsed");
        } else {
          $("#map .ol-zoom")
            .css("margin-left", $(".sidebar-left").width())
            .removeClass("zoom-top-opened-sidebar")
            .removeClass("zoom-top-collapsed");
        }
      }



      function isConstrained() {
        return $(".sidebar").width() == $(window).width();
      }

      function applyInitialUIState() {
        if (isConstrained()) {
          $(".sidebar-left .sidebar-body").fadeOut('slide');
          $('.mini-submenu-left').fadeIn();
        }
      }


    // Return public methods
    return {
        initialize: initialize,
	cgalProcessing: cgalProcessing
    };


});

