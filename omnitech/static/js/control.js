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
Control.satisfiedDemandBar = $("#satisified-demand-bar");
Control.demandDisplay = $("#demand");
Control.resetButton = $("#reset");
Control.interval = 2000;

Control.engineCounter = 0;
Control.processId = -1;
Control.demand = 0;
Control.isReady = true;

Control.engineTemplate = "<div id='{0}' class='row engine-row engine-type-{1}'> \
                              <div class='col-xs-11'> \
                                  <span class='engine-type-label'>{2}</span> \
                                  <div class='progress progress-striped active'> \
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
    engineProgressDiv.addClass("active").addClass("progress-striped");
    engineProgressBar.removeClass("progress-bar-warning").addClass("progress-bar-success").addClass("active");
    
    EngineManager.enableEngine(id);
    Control.isReady = true;
};

Control.disableEngine = function(id, toggleButton) {
    Control.isReady = false;
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");
    $(toggleButton).removeClass("btn-warning").addClass("btn-success");
    engineProgressDiv.removeClass("active").removeClass("progress-striped");
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
    Control.engineContainer.append(Control.engineTemplate.format(id, engineTypeId, engineType[0].fields.type));
    $("#" + id).hide().fadeIn();
    
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
    Control.satisfiedDemandBar.empty();
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
});