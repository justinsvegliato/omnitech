function EngineManager() {};

EngineManager.engines = [];

EngineManager.balance = function(demand) {
    $.ajax({
        type: 'get',
        async: false,
        url: "/engine_manager/balance/" + JSON.stringify(EngineManager.engines) + "/" + Control.demand + "/", 
        success: function(data) {
            Control.demandDisplay.html(Control.demand + "");
            Control.satisfiedDemandBar.empty();
            
            var engines = $.parseJSON(data);
            var progressBarTypes = ["success", "info", "warning", "danger"];
            $(".engine-status.progress-bar-success").each(function(index, object) {
                var percentageContributed = ((engines[index]._energyOutput / Control.demand) * 100) + "%";
                $(object).css("width", percentageContributed);

                var engineContribution = Control.demandContributionTemplate.format(progressBarTypes[index % 4], percentageContributed);
                Control.satisfiedDemandBar.append(engineContribution);
            });
        }
    });
};

EngineManager.addEngine = function(id, rpm, energyOutput, engineTypeIdId, isEnabled) {
    EngineManager.engines.push(new Engine(id, rpm, energyOutput, engineTypeIdId, isEnabled));
};

EngineManager.removeEngine = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            EngineManager.engines.splice(i, 1);
            break;
        }
    }
};

EngineManager.enableEngine = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            EngineManager.engines[i]._isEnabled = true;
            break;
        }
    }
};

EngineManager.disableEngine = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            EngineManager.engines[i]._isEnabled = true;
            EngineManager.engines[i]._rpm = 0;
            EngineManager.engines[i]._energyOutput = 0;
            break;
        }
    }
};

EngineManager.reset = function() {
    EngineManager.engines = [];
};

function Engine(id, rpm, energyOutput, engineTypeId, isEnabled) {
    this._id = id;
    this._rpm = rpm;
    this._energyOutput = energyOutput;
    this._engineTypeId = engineTypeId;
    this._isEnabled = isEnabled;
}
