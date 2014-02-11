function EngineManager() {};

EngineManager.engines = [];

EngineManager.balance = function(demand) {
    Control.energyDemandSeries.append(new Date().getTime(), demand);

    var engineTypeContribution = {};
    $("#type-input option").each(function(index, object) {
        engineTypeContribution[$(object).val()] = 0;
    });

    var systemCost = 0;
    var totalEngineContribution = 0;
    $.ajax({
        type: 'get',
        async: false,
        url: "/engine_manager/balance/" + JSON.stringify(EngineManager.engines) + "/" + Control.demand + "/", 
        success: function(data) {
            Control.demandDisplay.html(Control.demand + "");
            var engines = $.parseJSON(data);
            var progressBarTypes = ["success", "info", "warning", "danger"];
            $(".engine-status").each(function(index, object) {
                var percentageContributed = ((engines[index]._energyOutput / Control.demand) * 100) + "%";
                $(object).css("width", percentageContributed);

                var engineType = $.grep(engineTypes, function(n) {
                    return n.pk === parseFloat(engines[index]._engineTypeId);
                })[0];
                systemCost += (parseFloat(engineType.fields.linear_engine_cost) * parseFloat(engines[index]._rpm) + parseFloat(engineType.fields.fixed_engine_cost)) * engineType.fields.financial_cost;
                
                engineTypeContribution[engines[index]._engineTypeId] = engineTypeContribution[engines[index]._engineTypeId] + engines[index]._energyOutput;

                var rpm = parseFloat(Math.round(engines[index]._rpm * 100) / 100).toFixed(2);
                var energyOutput = parseFloat(Math.round(engines[index]._energyOutput * 100) / 100).toFixed(2);
                var energyOutputPercent = parseFloat(Math.round(Control.demand === 0 ? 0 : parseFloat(percentageContributed))).toFixed(2);

                totalEngineContribution += parseFloat(energyOutput);

                var dataContent = $("<div></div").html($.parseHTML($(object).parent().attr("data-content")));
                dataContent.find(".cost-variable").html(rpm);
                dataContent.find(".power-variable").html(energyOutput);
                dataContent.find(".power-percent-variable").html(energyOutputPercent);
                $(object).parent().attr('data-content', dataContent.html());

                var popover = $(object).parent().siblings(".popover");
                popover.find(".cost-variable").html(rpm);
                popover.find(".power-variable").html(energyOutput);
                popover.find(".power-percent-variable").html(energyOutputPercent);
            });
        }
    });

    EngineManager.getGridData(systemCost);

    Control.engineAggregationSeries.append(new Date().getTime(), totalEngineContribution);

    for (var key in engineTypeContribution) {
        Control.engineTypeSeries[key].append(new Date().getTime(), engineTypeContribution[key]);
    }
};

EngineManager.addEngine = function(id, rpm, energyOutput, engineTypeIdId, isEnabled) {
    var engine = new Engine(id, rpm, energyOutput, engineTypeIdId, isEnabled)
    EngineManager.engines.push(engine);
    return engine;
};

EngineManager.removeEngine = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            return EngineManager.engines.splice(i, 1)[0];
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
            EngineManager.engines[i]._isEnabled = false;
            EngineManager.engines[i]._rpm = 0;
            EngineManager.engines[i]._energyOutput = 0;
        }
    }
};

EngineManager.getGridData = function(systemCost) {
    var engineType = $.grep(engineTypes, function(n) {
        return n.fields.type === "Grid";
    })[0];

    $.ajax({
        type: 'get',
        async: false,
        url: "/engine_manager/balance/" + JSON.stringify([new Engine("999", 0, 0, engineType.pk, true)]) + "/" + Control.demand + "/", 
        success: function(data) {
            var grid = $.parseJSON(data)[0];
            var gridCost = (parseFloat(engineType.fields.linear_engine_cost) * parseFloat(grid._rpm) + parseFloat(engineType.fields.fixed_engine_cost)) * parseFloat(engineType.fields.financial_cost);
            Control.gridCostSeries.append(new Date().getTime(), gridCost);
            Control.systemCostSeries.append(new Date().getTime(), systemCost);
        }
    });
};

EngineManager.reset = function() {
    EngineManager.engines = [];
};

EngineManager.checkIfEngineTypeExists = function(engineTypeId) {
    var exists = false;
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._engineTypeId === engineTypeId) {
            exists = true;
            break;
        }        
    }
    return exists;
};

function Engine(id, rpm, energyOutput, engineTypeId, isEnabled) {
    this._id = id;
    this._rpm = rpm;
    this._energyOutput = energyOutput;
    this._engineTypeId = engineTypeId;
    this._isEnabled = isEnabled;
}
