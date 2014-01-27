function EngineManager() {};

EngineManager.engines = [];

EngineManager.balance = function(wattage) {
    var availablePower = 0;
    var enabledEngines = [];
    $.each(EngineManager.engines, function(index, value) {
        if (value._enabled) {
            availablePower += value._power;
            enabledEngines.push(value);
        }
    });
    
    var percentageUtilized = wattage / availablePower;    
    var adjustedPercentageUtilized = percentageUtilized > 1 ? 1 : percentageUtilized;
    $.each(enabledEngines, function(index, value) {
        value._utilizedPower = value._power * adjustedPercentageUtilized;
    });
};

EngineManager.addEngine = function(id, hp, enabled) {
    EngineManager.engines.push(new Engine(id, hp, enabled));
};

EngineManager.removeEngine = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            EngineManager.engines.splice(i, 1);
            break;
        }
    }
};

EngineManager.toggle = function(id) {
    for (var i = 0; i < EngineManager.engines.length; i++) {
        if (EngineManager.engines[i]._id === id) {
            EngineManager.engines[i]._enabled = !EngineManager.engines[i]._enabled;
            break;
        }
    }
};

EngineManager.reset = function() {
    EngineManager.engines = [];
};

function Engine(element, power, enabled) {
    this._id = element;
    this._power = power * 0.75;
    this._enabled = enabled;
    
    this._utilizedPower = 0;
}

