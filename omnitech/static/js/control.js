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
Control.interval = 250;

Control.engineCounter = 0;
Control.processId = -1;
Control.demand = 0;
Control.isReady = true;
Control.series = new TimeSeries();

Control.engineTemplate = "<div id='{0}' class='row engine-row engine-type-{1}'> \
                              <div class='col-xs-11'> \
                                  <span class='engine-type-label'>{2}</span> \
                                  <div class='progress progress-striped active' data-title='Engine Details' data-toggle='popover' \
                                       data-content='<div class=\"row\"><div class=\"col-xs-7\">RPM</div><div class=\"col-xs-5 rpm-variable\">{3}</div> \
                                                     <div class=\"col-xs-7\">Energy Output</div><div class=\"col-xs-5 energy-output-variable\">{4}</div> \
                                                     <div class=\"col-xs-7\">Fixed Cost</div><div class=\"col-xs-5\">{5}</div> \
                                                     <div class=\"col-xs-7\">Linear Cost</div><div class=\"col-xs-5\">{6}</div> \
                                                     <div class=\"col-xs-7\">Fixed Output</div><div class=\"col-xs-5\">{7}</div> \
                                                     <div class=\"col-xs-7\">Linear Output</div><div class=\"col-xs-5\">{8}</div> \
                                                     <div class=\"col-xs-7\">Minimum RPM</div><div class=\"col-xs-5\">{9}</div> \
                                                     <div class=\"col-xs-7\">Maximum RPM</div><div class=\"col-xs-5\">{10}</div></div>'> \
                                     <div class='engine-status progress-bar progress-bar-success' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'></div> \
                                  </div> \
                              </div> \
                              <div class='col-xs-1 engine-row-controls'> \
                                  <button type='button' class='toggle btn btn-warning btn-xs pull-left'><span class='glyphicon glyphicon-off'></span></button> \
                                  <button type='button' class='remove btn btn-danger btn-xs pull-right'><span class='glyphicon glyphicon-minus'></span></button> \
                              </div> \
                         </div>";

Control.demandContributionTemplate = "<div class='progress-bar progress-bar-{0}' style='width: {1}'> \
                                          <span class='sr-only'>35% Complete (success)</span>\
                                      </div>";

Control.start = function() {
    if (Control.engineCounter > 0) {
        Control.startStopButton.removeClass("btn-success").addClass("btn-danger");
        Control.startStopIcon.hide().fadeIn();
        Control.startStopIcon.removeClass("glyphicon-play").addClass("glyphicon-stop");

        var render = function() {
            if (Control.isReady) {        
                var low = +Control.lowInput.val();
                var high = +Control.highInput.val();
                Control.demand = low + Math.floor(Math.random() * (high - low));
                Control.render();
            }
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
        Control.render();
    }
};

Control.isActive = function() {
    return Control.processId !== -1;
};

Control.render = function() {      
    EngineManager.balance(Control.demand);
};

Control.enableEngine = function(id, toggleButton) {
    Control.isReady = false;
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");
    $(toggleButton).addClass("btn-warning").removeClass("btn-success");
    engineProgressBar.removeClass("progress-bar-warning").addClass("progress-bar-success").addClass("active");
    
    EngineManager.enableEngine(id);
    Control.isReady = true;
};

Control.disableEngine = function(id, toggleButton) {
    Control.isReady = false;
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");
    $(toggleButton).removeClass("btn-warning").addClass("btn-success");
    engineProgressBar.removeClass("progress-bar-success").addClass("progress-bar-warning").css("width", "0%");
    
    EngineManager.disableEngine(id);
    Control.isReady = true;
};

Control.addEngine = function() {
    Control.isReady = false;
    var engineTypeId = Control.typeInput.val();
    var id = "engine" + Control.engineCounter++;
    var engineType = $.grep(engineTypes, function(n) {
        return n.pk === parseInt(engineTypeId);
    });
    Control.engineContainer.append(Control.engineTemplate.format(
        id, 
        engineTypeId, 
        engineType[0].fields.type, 
        0, 
        0,
        engineType[0].fields.fixed_engine_cost,
        engineType[0].fields.linear_engine_cost,
        engineType[0].fields.fixed_energy_output,
        engineType[0].fields.linear_energy_output,
        engineType[0].fields.minimum_rpm,
        engineType[0].fields.maximum_rpm
    ));
    $("#" + id).hide().fadeIn();

    $("#" + id).find(".progress").popover({
        html: true,
        trigger: "hover",
        placement: "top",
        animation: false
    });
    
    EngineManager.addEngine(id, 0, 0, engineTypeId, true);
    Control.isReady = true;
};

Control.removeEngine = function(id) { 
    Control.isReady = false;
    $("#" + id).animate({
        height: 0,
        opacity: 0
    }, 'fast', function() {
        $(this).remove();
    });
    
    EngineManager.removeEngine(id);
    Control.isReady = true;
};

Control.reset = function() {
    Control.isReady = false;
    Control.content.hide().fadeIn("slow");
    Control.engineCounter = 0;
    Control.engineContainer.empty();
    Control.typeInput.val("");
    Control.lowInput.val("");
    Control.highInput.val("");
    Control.stop();
    
    EngineManager.reset();
    Control.isReady = true;
};

$(document).ready(function() {
    Control.content.fadeIn("slow");

    Control.addButton.on("click", function() {
        Control.addEngine();
        Control.render();
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
    });

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

        $(this).css("background-color", "");
        $(this).css("cursor", "");
    });

    $(".progress").live("mouseover", function() {
        var child = $(this).children(".progress-bar");
        child.css("background-color", "#afafaf");
        child.css("cursor", "pointer");
        
        $(this).css("background-color", "#dbdbdb");
        $(this).css("cursor", "pointer");
    }).live('mouseout', function() {
        var child = $(this).children(".progress-bar");
        child.css("background-color", "");
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

        var child = parent.children(".progress-bar");
        child.css("background-color", "");
        child.css("cursor", "");
    });

    var chart = new SmoothieChart({
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

    var canvas = document.getElementById('chart');

    chart.addTimeSeries(Control.series, {
        lineWidth: 1.9,
        strokeStyle: '#c0c0c0',
        fillStyle: 'rgba(0,0,0,0.11)'
    });

    chart.streamTo(canvas, 0);
});