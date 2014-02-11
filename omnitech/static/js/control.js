function Control() {};

Control.content = $("#content");
Control.controls = $("#controls");
Control.addButton = $("#add");
Control.removeButton = $(".remove");
Control.startStopButton = $("#start-stop");
Control.typeInput = $("#type-input");
Control.lowInput = $("#low-input");
Control.highInput = $("#high-input");
Control.startStopIcon = $("#start-stop-icon");
Control.engineContainer = $("#engine-container");
Control.toggleButton = $(".toggle");
Control.demandDisplay = $("#demand");
Control.progressBar = $(".progress-bar");
Control.resetButton = $("#reset");

Control.interval = 750;

Control.engineCounter = 0;
Control.processId = -1;
Control.demand = 0;

Control.demandChart = new SmoothieChart({
    millisPerPixel: 30,
    maxValueScale: 1.2,
    grid: {
        fillStyle: 'transparent',
        strokeStyle: 'rgba(119,119,119,0.45)',
        millisPerLine: 6000,
        verticalSections: 0
    },
    labels: {
        fillStyle: '#424242',
        fontSize: 14,
        precision: 0
    },
    minValue: 0
});
Control.costChart =  new SmoothieChart({
    millisPerPixel: 30,
    maxValueScale: 1.2,
    grid: {
        fillStyle: 'transparent',
        strokeStyle: 'rgba(119,119,119,0.45)',
        millisPerLine: 6000,
        verticalSections: 0
    },
    labels: {
        fillStyle: '#424242',
        fontSize: 14,
        precision: 0
    },
    minValue: 0
});
Control.energyDemandSeries = new TimeSeries();
Control.engineAggregationSeries = new TimeSeries();
Control.engineTypeSeries = {};
Control.systemCostSeries = new TimeSeries();
Control.gridCostSeries = new TimeSeries();
Control.engineTypeColors = {};
Control.engineTypeMap = {}
Control.colors = ["#03c03c", "#779ecb",  "#aec6cf", "#77dd77", "#966fd6", "#dea5a4", 
                  "#fdfd96", "#ffb347", "#ff6961", "#c23b22", "#b19cd9", "#cfcfc4", "#f49ac2"];

Control.engineTemplate = "<div id='{0}' class='row engine-row engine-type-{1}'> \
                              <div class='col-xs-11'> \
                                  <span class='engine-type-label'>{2}</span> \
                                  <div class='progress progress-striped active' data-title='<span class=\"lead\">Source Details</span>' data-toggle='popover' \
                                       data-content='<div class=\"row\"><div class=\"col-xs-7 text-info\"><small><strong>Cost</strong> ($/min)</small></div><div class=\"col-xs-5 text-danger\"><small><strong><span class=\"cost-variable\">{3}</span></strong></small></div> \
                                                     <div class=\"col-xs-7 text-info\"><small><strong>Power</strong> (kw/min)</small></div><div class=\"col-xs-5 text-danger\"><small><strong><span class=\"power-variable\">{4}</span></strong></small></div> \
                                                     <div class=\"col-xs-7 text-info\"><small><strong>Power</strong> (%/min)</small></div><div class=\"col-xs-5 text-danger\"><small><strong><span class=\"power-percent-variable\">{5}</span></strong></small></div></div>'> \
                                     <div class='engine-status progress-bar progress-bar-success' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%; background-color:{6}'></div> \
                                  </div> \
                              </div> \
                              <div class='col-xs-1 engine-row-controls'> \
                                  <button type='button' class='toggle btn btn-warning btn-xs pull-left'><span class='glyphicon glyphicon-off'></span></button> \
                                  <button type='button' class='remove btn btn-danger btn-xs pull-right'><span class='glyphicon glyphicon-minus'></span></button> \
                              </div> \
                         </div>";

Control.start = function() {
    if (Control.engineCounter > 0) {
        Control.startStopButton.removeClass("btn-success").addClass("btn-danger");
        Control.startStopIcon.hide().fadeIn();
        Control.startStopIcon.removeClass("glyphicon-play").addClass("glyphicon-stop");

        Control.costChart.start();
        Control.demandChart.start();

        var render = function() {    
            var low = +Control.lowInput.val();
            var high = +Control.highInput.val();
            Control.demand = low + Math.floor(Math.random() * (high - low));
            Control.render();
        };

        render();
        Control.processId = window.setInterval(render, Control.interval);
    }
};

Control.stop = function() {
    if (Control.processId !== -1) {
        Control.startStopButton.addClass("btn-success").removeClass("btn-danger");
        Control.startStopIcon.hide().fadeIn();
        Control.startStopIcon.addClass("glyphicon-play").removeClass("glyphicon-stop");

        window.clearInterval(Control.processId);
        Control.processId = -1;
        Control.demand = 0;

        Control.costChart.stop();
        Control.demandChart.stop();
    }
};

Control.isActive = function() {
    return Control.processId !== -1;
};

Control.render = function() {     
    if (Control.isActive()) {
        EngineManager.balance(Control.demand);
    }
};

Control.enableEngine = function(id, toggleButton) {
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");
    $(toggleButton).addClass("btn-warning").removeClass("btn-success");
    engineProgressBar.removeClass("progress-bar-warning").addClass("progress-bar-success").addClass("active");
    engineProgressBar.css("background-color", Control.engineTypeColors[Control.engineTypeMap[id]]);
    
    EngineManager.enableEngine(id);
};

Control.disableEngine = function(id, toggleButton) {
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");
    $(toggleButton).removeClass("btn-warning").addClass("btn-success");
    engineProgressBar.removeClass("progress-bar-success").addClass("progress-bar-warning").css("width", "0%");
    engineProgressBar.css("background-color", "");
    
    EngineManager.disableEngine(id);
};

Control.addEngine = function(engineTypeId) {
    var id = "engine" + Control.engineCounter++;
    var engineType = $.grep(engineTypes, function(n) {
        return n.pk === parseInt(engineTypeId);
    });

    Control.engineContainer.append(Control.engineTemplate.format(
        id, 
        engineTypeId, 
        engineType[0].fields.type, 
        "0.00",
        "0.00",
        "0.00",
        Control.engineTypeColors[engineTypeId]     
    ));

    $("#" + id).hide().fadeIn();

    $("#" + id).find(".progress").popover({
        html: true,
        trigger: "hover",
        placement: "top",
        animation: false
    });

    Control.engineTypeMap[id] = engineTypeId;

    EngineManager.addEngine(id, 0, 0, engineTypeId, true);
};

Control.removeEngine = function(id) { 
    $("#" + id).animate({
        height: 0,
        opacity: 0
    }, 'fast', function() {
        $(this).remove();
        var engine = EngineManager.removeEngine(id);
        delete Control.engineTypeMap[id];
    });
};

Control.reset = function() {
    Control.content.hide().fadeIn("slow");
    Control.engineCounter = 0;
    Control.engineContainer.empty();
    Control.typeInput.val("");
    Control.lowInput.val("");
    Control.highInput.val("");
    Control.stop();
    
    EngineManager.reset();
};

Control.initializeCharts = function() {
    Control.demandChart.addTimeSeries(Control.energyDemandSeries, {
        lineWidth: 5.5,
        strokeStyle: '#c0c0c0',
        fillStyle: 'rgba(0, 0, 0, 0.11)'
    });
    Control.demandChart.addTimeSeries(Control.engineAggregationSeries, {
        lineWidth: 2,
        strokeStyle: '#555555',
        fillStyle: 'rgba(0, 0, 0, 0)'
    });
    Control.demandChart.streamTo(document.getElementById('demand-chart'), 0);
    Control.demandChart.start();

    $("#type-input option").each(function(index, object) {
        var engineTypeId = $(object).val();
        Control.engineTypeColors[engineTypeId] = Control.colors[index % Control.colors.length];
        var timeSeries = new TimeSeries();
        Control.engineTypeSeries[engineTypeId] = timeSeries;
        Control.demandChart.addTimeSeries(timeSeries, {
            lineWidth: 1.9,
            strokeStyle: Control.engineTypeColors[engineTypeId],
            fillStyle: 'rgba(0, 0, 0, 0)'
        });
    });

    Control.costChart.addTimeSeries(Control.gridCostSeries, {
        lineWidth: 1.9,
        strokeStyle: '#c0c0c0',
        fillStyle: 'rgba(0, 0, 0, 0)'
    });
    Control.costChart.addTimeSeries(Control.systemCostSeries, {
        lineWidth: 1.9,
        strokeStyle: '#000000',
        fillStyle: 'rgba(0, 0, 0, 0)'
    });
    Control.costChart.streamTo(document.getElementById('cost-chart'), 0);
    Control.costChart.start();
};

Control.initializeButtons = function() {
    Control.addButton.on("click", function() {
        var input = Control.typeInput.val(); 
        if (input) {
            Control.addEngine(input);
            Control.render();
        }
    });

    Control.removeButton.live("click", function() {
        var id = $(this).parent().parent().attr("id");
        Control.removeEngine(id);
        Control.render();
    });

    Control.startStopButton.on("click", function() {
        if (!Control.isActive()) {
            Control.start();
        } else {
            Control.stop();
        }
    });

    Control.toggleButton.live('click', function() {
        var id = $(this).parent().parent().attr("id");
        if ($(this).hasClass("btn-success")) {
            Control.enableEngine(id, this);
        } else {
            Control.disableEngine(id, this);            
        }
        Control.render();
    });

    Control.resetButton.on("click", function() {
        Control.reset();
        Control.render();
    });
};

Control.initializeHoverEffects = function() {
    $(".progress-bar").live("mouseover", function() {
        var parent = $(this).parent(".progress");
        parent.css("background-color", "#dbdbdb");
        parent.css("cursor", "pointer");

        $(this).css("background-color", "#afafaf");
        $(this).css("cursor", "pointer");
    }).live('mouseout', function() {
        var parent = $(this).parent(".progress");
        parent.css("background-color", "");
        parent.css("cursor", "");

        var rowId = $(this).closest(".engine-row").attr("id");
        $(this).css("background-color", Control.engineTypeColors[Control.engineTypeMap[rowId]]);
        $(this).css("cursor", "");
    });

    $(".progress").live("mouseover", function() {
        var child = $(this).children(".progress-bar");
        child.css("background-color", "#afafaf");
        child.css("cursor", "pointer");
        
        $(this).css("background-color", "#dbdbdb");
        $(this).css("cursor", "pointer");
    }).live('mouseout', function() {
        var rowId = $(this).closest(".engine-row").attr("id");
        var child = $(this).children(".progress-bar");
        child.css("background-color", Control.engineTypeColors[Control.engineTypeMap[rowId]]);
        child.css("cursor", "");

        $(this).css("background-color", "");
        $(this).css("cursor", "");
    });

    $(".engine-type-label").live("mouseover", function() {
        var parent = $(this).siblings(".progress");
        parent.css("background-color", "#dbdbdb");
        parent.css("cursor", "pointer");

        var child = parent.children(".progress-bar");
        child.css("background-color", "#afafaf");
        child.css("cursor", "pointer");
    }).live('mouseout', function() {
        var parent = $(this).siblings(".progress");
        parent.css("background-color", "");
        parent.css("cursor", "");

        var rowId = $(this).closest(".engine-row").attr("id");
        var child = parent.children(".progress-bar");
        child.css("background-color", Control.engineTypeColors[Control.engineTypeMap[rowId]]);
        child.css("cursor", "");
    });
};

Control.initializeTabs = function() {
    $("#cost-tab-button").on("click", function () {
        if (Control.isActive()) {
            Control.demandChart.stop();
            Control.costChart.start();
        }
    });

    $("#demand-tab-button").on("click", function () {
        if (Control.isActive()) {
            Control.demandChart.start();
            Control.costChart.stop();
        }
    });
};

Control.initializeExampleEngines = function() {
    $("#type-input option").each(function(index, object) {
        if ($(object).val()) {
            Control.addEngine($(object).val());
        }
    });
};

Control.initialize = function() {
    Control.initializeButtons();
    Control.initializeHoverEffects();
    Control.initializeCharts();
    Control.initializeTabs();
    Control.initializeExampleEngines();

    Control.content.fadeIn("slow");
};

$(document).ready(function() {
    Control.initialize();
});