function Control() {};

Control.content = $("#content");
Control.controls = $("#controls");
Control.addButton = $("#add");
Control.removeButton = $(".remove");
Control.startStopButton = $("#start-stop");
Control.hpInput = $("#hp-input");
Control.quantityInput = $("#quantity-input");
Control.lowInput = $("#low-input");
Control.highInput = $("#high-input");
Control.startStopIcon = $("#start-stop-icon");
Control.engineContainer = $("#engine-container");
Control.toggleButton = $(".toggle");
Control.satisfiedDemandBar = $("#satisified-demand-bar");
Control.demandDisplay = $("#demand");
Control.resetButton = $("#reset");
Control.interval = 3000;

Control.engineCounter = 0;
Control.processId = -1;
Control.demand = 0;

Control.engineTemplate = "<div id='{0}' class='row'> \
                              <div class='hp-display col-xs-1'><span class='label label-primary'>{1} HP</span></div> \
                              <div class='col-xs-10'> \
                                   <div class='progress progress-striped active'> \
                                      <div class='engine-status progress-bar progress-bar-success' role='progressbar' aria-valuenow='40' aria-valuemin='0' aria-valuemax='100' style='width: 0%'> \
                                          <span class='sr-only'>0% utilization</span> \
                                      </div> \
                                  </div> \
                              </div> \
                              <div class='col-xs-1'> \
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
        Control.render();
    }
};

Control.isActive = function() {
    return Control.processId !== -1;
};

Control.render = function() { 
    Control.demandDisplay.html(Control.demand + "");
    
    EngineManager.balance(Control.demand);
    
    Control.satisfiedDemandBar.empty();
    
    var progressBarTypes = ["success", "info", "warning", "danger"];
    var enginesUtilized = 0;
    $.each(EngineManager.engines, function(index, value) {
        if (value._enabled) {
            var percentageUtilized = ((value._utilizedPower / value._power) * 100) + "%";
            $("#" + value._id + " .engine-status").css("width", percentageUtilized);
            
            var percentageContributed = ((value._utilizedPower / Control.demand) * 100) + "%";
            var engineContribution = Control.demandContributionTemplate.format(progressBarTypes[enginesUtilized++ % 4], percentageContributed);
            Control.satisfiedDemandBar.append(engineContribution);
        }
    });
};

Control.addEngine = function() {
    var hp = Control.hpInput.val();
    var amount = Control.quantityInput.val();
    for (var i = 0; i < amount; i++) {
        var id = "engine" + Control.engineCounter++;
        Control.engineContainer.append(Control.engineTemplate.format(id, hp));
        $("#" + id).hide().fadeIn();
        EngineManager.addEngine(id, +Control.hpInput.val(), true);
    }
};

Control.removeEngine = function(id) {
    $("#" + id).animate({height: 0, opacity: 0}, 'fast', function() {
        $(this).remove();
    });
    EngineManager.removeEngine(id);
};

Control.toggleEngine = function(id, toggleButton) {
    var engineProgressDiv = $("#" + id + " .progress");
    var engineProgressBar = $("#" + id + " .progress .progress-bar");

    EngineManager.toggle(id);
    if (engineProgressBar.hasClass("progress-bar-success")) {
        $(toggleButton).removeClass("btn-warning").addClass("btn-success");
        engineProgressDiv.removeClass("active").removeClass("progress-striped");
        engineProgressBar.removeClass("progress-bar-success").addClass("progress-bar-warning").css("width", "0%");
    } else {
        $(toggleButton).addClass("btn-warning").removeClass("btn-success");
        engineProgressDiv.addClass("active").addClass("progress-striped");
        engineProgressBar.removeClass("progress-bar-warning").addClass("progress-bar-success").addClass("active");
    }   
};

Control.reset = function() {    
    if (Control.engineCounter > 0) {
        Control.content.hide().fadeIn("slow");
        EngineManager.reset();
        Control.engineCounter = 0;
        Control.satisfiedDemandBar.empty();
        Control.engineContainer.empty();
        Control.hpInput.val("");
        Control.quantityInput.val("");
        Control.lowInput.val(""); 
        Control.highInput.val("");
        Control.stop(); 
    }
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
    
    Control.startStopButton.on("click", function () {
        if (!Control.isActive()) {
            Control.start();
        } else {
            Control.stop();
        }
    });
    
    Control.toggleButton.live('click', function() {
        var id = $(this).parent().parent().attr("id");
        Control.toggleEngine(id, this);
        Control.render();
    });
    
    Control.resetButton.on("click", function() {
        Control.reset();
    });
});