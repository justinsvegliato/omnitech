from cvxopt.modeling import variable, op, dot, sum, matrix
from models import EngineType

class EngineManager:    

    def __init__(self):
        self.engines = []
    
    def add(self, type):
        engine_type = EngineType.objects.get(pk=type)
        engine = Engine(0, 0, True, engine_type)
        self.engines.append(engine)        
        
    def delete(self, index):
        self.engines.pop(index)
        
    def toggle(self, index):
        self.engines[index].is_enabled = not self.engines[index].is_enabled

    def balance(self, energy_demand):
        active_engines = filter(lambda engine: engine.is_enabled, self.engines)
        
        if len(active_engines) <= 0:
            return []
            
        rpms = variable(len(active_engines), 'rpms')    

        fixed_engine_costs = matrix([float(engine.engine_type.fixed_engine_cost) for engine in active_engines])
        linear_engine_costs = matrix([float(engine.engine_type.linear_engine_cost) for engine in active_engines])

        fixed_energy_outputs = matrix([float(engine.engine_type.fixed_energy_output) for engine in active_engines])
        linear_energy_outputs = matrix([float(engine.engine_type.linear_energy_output) for engine in active_engines])

        minimum_rpms = matrix([float(engine.engine_type.minimum_rpm) for engine in active_engines])
        maximum_rpms = matrix([float(engine.engine_type.maximum_rpm) for engine in active_engines])

        energy_demand_constraint = ((float(energy_demand) - dot(rpms, linear_energy_outputs) - sum(fixed_energy_outputs)) <= 0)

        maximum_rpm_constraint = ((rpms - maximum_rpms) <= 0)
        minimum_rpm_constraint = ((rpms - minimum_rpms) >= 0)

        constraints = [energy_demand_constraint, maximum_rpm_constraint, minimum_rpm_constraint]                
        objective_function = op((dot(linear_engine_costs, rpms) - sum(fixed_engine_costs)), constraints)        
                      
        objective_function.solve()       
        
        for i in range(len(active_engines)):
            engine = active_engines[i]
            engine.rpm = rpms.value[i]
            engine.energy_output = float(engine.engine_type.fixed_energy_output) * engine.rpm + float(engine.engine_type.fixed_energy_output)
            
        return active_engines              