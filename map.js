var map = L.map('map', {zoomControl: false}).setView([40.11, -89.3985], 6); //initialized map
var menu = $('#variables');
var leg = $('#legends');

// initialized basemap and add it
L.tileLayer('http://{s}.api.cartocdn.com/base-eco/{z}/{x}/{y}.png', {
  zoomControl: false,
  maxZoom: 14,
  minZoom:6,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

// add zoom controls
L.control.zoom({
  position:'topright'
}).addTo(map);

// global variables for map code
var geojsonProperties = [];//array of property names
var categories = ["Select a Category", "Student Data", "Teacher & Classroom Stat", "District Funding Source", "District Expenditure: General Data", "District Expenditure: Detailed Data", "Other Finance Details"];
var details = ["Select a Category From Above"];
var ranges = {};
var selectedProperty = null;
var unifiedMap;
var secondaryMap;
var elementaryMap;
var unifiedLegend;
var secondaryLegend;
var elementaryLegend;
var layerToggle;
var currentYear;

//Create UI for menu
//add options to menu

//field two: categories
var $category = $('#category-choice');
  //.appendTo($('#variables'));

//field three: details
var $detail = $('#detail-choice')
  //.appendTo($('#variables'))
  .on('change', function() {
    setVariable($(this).val());
    updateMap(selectedProperty);//map updates when a detail is changed
});

//set initial categories
for (var i = 0; i < categories.length; i++) {
$('<option></option>')
  .text(categories[i])
  .attr('value', categories[i])
  .appendTo($category);
}
//set initial details
for (var i = 0; i < details.length; i++) {
$('<option></option>')
  .text(details[i])
  .attr('value', details[i])
  .appendTo($detail);
}

//When date is selected update category fields
//handles when a category is selected
$("#category-choice").change(function() {
  var dropdownCategory = $(this);

  $.getJSON("data/data_v1.json", function(data) {
    var value = dropdownCategory.val();
    var vals = [];

    switch (value) {
      case 'Student Data':
        vals = data.studentData2016.split(",");
      break;
      case 'Teacher & Classroom Stat':
        vals = data.teacherClassroomStat2016.split(",");
      break;
      case 'District Funding Source':
        vals = data.districtFundingSource2016.split(",");
      break;
      case 'District Expenditure: General Data':
        vals = data.districtExpenditureGeneral2016.split(",");
      break;
      case 'District Expenditure: Detailed Data':
        vals = data.districtExpenditureDetail2016.split(",");
      break;
      case 'Other Finance Details':
        vals = data.financeDetails2016.split(",");
      break;
      case 'Select a Category':
        vals = ['Select a Category From Above'];
      break;
      }

    //updates detailed feild based off of category and year
    var detailMenu = $("#detail-choice");
    detailMenu.empty();
    $.each(vals, function(index, value) {
      var newTempVal = value.replace(/_/g, ' ');//remove "_" so it is more readable
      detailMenu.append("<option>" + newTempVal + "</option>");
    });
  });
});


// function that gets & sets a variable to whatever the user selects
function setVariable(name) {
  var newName = name.replace(/ /g, '_'); //add "_" so it works with geojson
  selectedProperty = newName;
  return selectedProperty;
}

// removes current goejson layer, and add new one with updated info
function updateMap(selectedProperty) {
  // remove old geojson layers
  unifiedMap.clearLayers();
  elementaryMap.clearLayers();
  secondaryMap.clearLayers();

  //remove layer toggle controller
  map.removeControl(layerToggle);
  // removes old legends
  map.removeControl(unifiedLegend);

  preloaderOn();//turn on preloader when new field selected

  // add new maps, legends, and toggle control to the map
  $.when(
    $.getJSON('data/newData/2017_secondary.geojson'),
    $.getJSON('data/newData/2017_unified.geojson'),
    $.getJSON('data/newData/2017_elementary.geojson')
  ).done(function (secondaryGeojson, unifiedGeojson, elementaryGeojson) {
    preloaderOff();//turn off preloader when data is done loading
    var secondaryLayer = secondaryGeojson[0];
    var unifiedLayer = unifiedGeojson[0];
    var elementaryLayer = elementaryGeojson[0];

    var propertyHolder = unifiedGeojson[0].legends[selectedProperty];

    var newString = selectedProperty.replace(/_/g, ' ');
    // console.log(newString);

    // Unified Layer, and the legend
    unifiedMap = L.choropleth(unifiedLayer, {
      valueProperty: selectedProperty,
      scale: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color,propertyHolder[9].color],
      steps: 10,
      mode: 'q', // q for quantile, e for equidistant, k for k-means
      style: {
        color: '#F3F2F4',
        weight: 1,
        fillOpacity: 1
      },
      onEachFeature: function (feature, layer) {
        if (propertyHolder[0].display_units == "$") {
          layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + propertyHolder[0].display_units + feature.properties[selectedProperty]);
        } else {
          layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + feature.properties[selectedProperty] + propertyHolder[0].display_units);
        }
      }
    }).addTo(map);

    unifiedLegend = L.control({ position: 'bottomleft' });
    unifiedLegend.onAdd = function (unifiedLayer, map) {
      var div = L.DomUtil.create('div', 'info legend');
      var limits = unifiedMap.options.limits;
      var colors = unifiedMap.options.colors;
      var labels = [];

      div.innerHTML = '<div class="labels"><div class="min">' + 'Data Breaks:' + '</br>' + '</div> \
      <div class="max">' + '</br>' + '</div></div>';
        limits.forEach(function (limit, index) {
          if (propertyHolder[index].percentile == propertyHolder[index].stop) {
            labels.push('<li style="background-color: ' + colors[index] + '">' + '<div class=" legend-stop legend-stop' + [index] + '">' + propertyHolder[index].display_value + '</div>' + '<div style="opacity:0" class=" legend-break legend-stop' + [index] + '">' + "-" + '</div>' + '</li>');
          } else {
            labels.push('<li style="background-color: ' + colors[index] + '">' + '<div class=" legend-stop legend-stop' + [index] + '">' + propertyHolder[index].percentile + "%" + '</div>' + '<div class=" legend-break legend-stop' + [index] + '">' + propertyHolder[index].display_value + '</div>' + '</li>');
          }
      });
      div.innerHTML += '<ul>' + labels.join('') + '</ul>';
      return div;
    }
    unifiedLegend.addTo(map);

    // add secondary map

    if(secondaryGeojson[0].features[1].properties[selectedProperty]) {
    secondaryMap = L.choropleth(secondaryLayer, {
      valueProperty: selectedProperty,
      colors: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color],
      steps: 9,
      mode: 'q', // q for quantile, e for equidistant, k for k-means
      style: {
        color: '#F4F2F3',
        weight: 1,
        fillOpacity: 1
      },
      onEachFeature: function (feature, layer) {
        if (propertyHolder[0].display_units == "$") {
          layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + propertyHolder[0].display_units + feature.properties[selectedProperty]);
        } else {
          layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + feature.properties[selectedProperty] + propertyHolder[0].display_units);
        }
      }
    }).addTo(map);
  } else {
  console.log('sec does not exist here');
  }

    // Elementary Layer
    // add a condition incase properties does not exist for specific feild
    if(elementaryGeojson[0].features[0].properties[selectedProperty]) {
      elementaryMap = L.choropleth(elementaryLayer, {
        valueProperty: selectedProperty,
        colors: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color],
        steps: 9,
        mode: 'q', // q for quantile, e for equidistant, k for k-means
        style: {
          color: '#F3F2F4',
          weight: 1,
          fillOpacity: 1
        },
        onEachFeature: function (feature, layer) {
          if (propertyHolder[0].display_units == "$") {
            layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + propertyHolder[0].display_units + feature.properties[selectedProperty]);
          } else {
            layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + newString + ': ' + '</b>' + feature.properties[selectedProperty] + propertyHolder[0].display_units);
          }
        }
      }).addTo(map);
    } else {
    console.log('ele does not exist here');
    }

    var uniLegendHTML = unifiedLegend.getContainer();//temp var for legend

    var legendContainer = document.getElementById('legends');

    // add legends to menu container
    function setParent(el, newParent) {
      newParent.appendChild(el);
    }

    setParent(uniLegendHTML, legendContainer);//add parent to menu

    // craete overlay variables
    var overlayMaps = {
      "Elementary Education": elementaryMap,
      "Secondary Education": secondaryMap,
      "Unified Eduction": unifiedMap
    };

    //adding layer controls
    layerToggle = L.control.layers(null, overlayMaps, {collapsed:false}).addTo(map);

    //code to keep toggle layers expanded
    $(".leaflet-control-layers").mouseenter(function(){
      layerToggle.expand(this);
    });

    $( ".leaflet-control-layers" ).mouseleave(function() {
      layerToggle.expand(this);
    });

    window.onclick = myFunction;

    function myFunction() {
      layerToggle.expand(this);
    }

    var layerToggleHTML = layerToggle.getContainer();
    var toggleContainer = document.getElementById('toggle');

    setParent(layerToggleHTML, toggleContainer);
  });
  // end update function
}

// add geojson layers to map and add style to them at start
$.when(
  $.getJSON('data/newData/2017_secondary.geojson'),
  $.getJSON('data/newData/2017_unified.geojson'),
  $.getJSON('data/newData/2017_elementary.geojson')
).done(function (secondaryGeojson, unifiedGeojson, elementaryGeojson) {
  var unifiedLayer = unifiedGeojson[0];
  var secondaryLayer = secondaryGeojson[0];
  var elementaryLayer = elementaryGeojson[0];

  var propertyHolder = unifiedGeojson[0].legends['District_Black_Percent_2016'];

  // Unified Layer, and the legend
  unifiedMap = L.choropleth(unifiedLayer, {
    valueProperty: 'District_Black_Percent_2016',
    colors: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color, propertyHolder[9].color],
    steps: 10,
    mode: 'q', // q for quantile, e for equidistant, k for k-means
    style: {
      color: '#F3F2F4',
      weight: 1,
      fillOpacity: 1
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + '' + '</b>' + 'Select a category to begin exploring data.');
    }
  }).addTo(map);

  unifiedLegend = L.control({ position: 'bottomleft' });
  unifiedLegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var limits = unifiedMap.options.limits;
    var colors = unifiedMap.options.colors;
    var labels = [];

    div.innerHTML = '<div class="labels"><div class="min">' + 'Data Breaks:' + '</br>' + '</div> \
    <div class="max">' + '</br>' + '</div></div>';
      limits.forEach(function (limit, index) {
        labels.push('<li style="background-color: ' + colors[index] + '">' + '<div class=" legend-stop legend-start' + [index] + '">' + "Percents" + '</div>' + '<div class=" legend-break legend-start' + [index] + '">' + "Values" + '</div>' + '</li>');
    });
    div.innerHTML += '<ul>' + labels.join('') + '</ul>';
    return div;
  }
  unifiedLegend.addTo(map);

  // Secondary Layer and Legend
  secondaryMap = L.choropleth(secondaryLayer, {
    valueProperty: 'District_Black_Percent_2016',
    colors: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color,propertyHolder[9].color],
    steps: 10,
    mode: 'q', // q for quantile, e for equidistant, k for k-means
    style: {
      color: '#F4F2F3',
      weight: 1,
      fillOpacity: 1
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + '' + '</b>' + 'Select a year to begin exploring data.');
    }
  }).addTo(map);

  // Elementary Layer
  elementaryMap = L.choropleth(elementaryLayer, {
    valueProperty: 'District_Black_Percent_2016',
    colors: [propertyHolder[0].color, propertyHolder[1].color, propertyHolder[2].color, propertyHolder[3].color, propertyHolder[4].color, propertyHolder[5].color, propertyHolder[6].color, propertyHolder[7].color, propertyHolder[8].color, propertyHolder[9].color],
    steps: 10,
    mode: 'q', // q for quantile, e for equidistant, k for k-means
    style: {
      color: '#F3F2F4',
      weight: 1,
      fillOpacity: 1
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup('<p class="popup-title">' + '<b>' + 'District Name: ' + '</b>' + feature.properties.NAME + '</p>' + '<br>' + '<b>' + '' + '</b>' + 'Select a year to begin exploring data.');
    }
  }).addTo(map);

  var uniLegendHTML = unifiedLegend.getContainer();

  var legendContainer = document.getElementById('legends');

  // add legends to menu container
  function setParent(el, newParent) {
    newParent.appendChild(el);
  }

  setParent(uniLegendHTML, legendContainer);

  // creating overlay variable
  var overlayMaps = {
    "Elementary Education": elementaryMap,
    "Secondary Education": secondaryMap,
    "Unified Eduction": unifiedMap
  };

  //adding layer controls
  layerToggle = L.control.layers(null, overlayMaps, {collapsed:false}).addTo(map);

  //code to keep toggle layers expanded
  $(".leaflet-control-layers").mouseenter(function(){
    layerToggle.expand(this);
  });

  $( ".leaflet-control-layers" ).mouseleave(function() {
    layerToggle.expand(this);
  });

  window.onclick = myFunction;

  function myFunction() {
    layerToggle.expand(this);
  }

  var layerToggleHTML = layerToggle.getContainer();
  var toggleContainer = document.getElementById('toggle');

  setParent(layerToggleHTML, toggleContainer);

//end code
preloaderOff();
});

// Global Functions
var preloaderOff = function() {
  var preloader = document.getElementById("preloader");
  preloader.style.opacity = "0";
  preloader.setAttribute("aria-busy", "false");
}
var preloaderOn = function() {
  var preloader = document.getElementById("preloader");
  preloader.style.opacity = ".87";
  preloader.setAttribute("aria-busy", "true");
}
