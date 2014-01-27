from cvxopt.modeling import variable, op, dot, sum, matrix

def get_rpm_distribution(energy_demand):
    rpms = variable(3, "rpms")  
    
    fixed_engine_costs = matrix([5., 4., 2.])
    linear_engine_costs = matrix([1., 4., 1.])
    
    fixed_energy_outputs = matrix([6., 7., 8.])
    linear_energy_outputs = matrix([20., 43., 23.])
    
    maximum_rpms = matrix([400., 400., 400.])
    minimum_rpms = matrix([200., 10., 200.])
    
    energy_demand_constraint = ((energy_demand - dot(rpms, linear_energy_outputs) - sum(fixed_energy_outputs)) <= 0)
    
    maximum_rpm_constraint = ((rpms - maximum_rpms) <= 0)
    minimum_rpm_constraint = ((rpms - minimum_rpms) >= 0)
    
    constraints = [energy_demand_constraint, maximum_rpm_constraint, minimum_rpm_constraint]                
    objective_function = op((dot(linear_engine_costs, rpms) - sum(fixed_engine_costs)), constraints)    
    
    objective_function.solve();
    
    return rpms.value
    
def main():
    print get_rpm_distribution(10)    

if __name__ == "__main__":
    main()