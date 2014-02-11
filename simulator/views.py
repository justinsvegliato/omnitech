from cvxopt.modeling import variable, op, dot, sum, matrix
from django.shortcuts import render
from models import EngineType
from django.http import HttpResponse
from simulator.forms import AddEngineForm
from django.template import RequestContext
from django.core import serializers
import json
import random

def index(request):
    context_instance = RequestContext(request)
    context_instance.autoescape = False  
    object_context = {
        "add_engine_form": AddEngineForm(),
        "engine_types": serializers.serialize("json", EngineType.objects.all())        
    }
    return render(request, "simulator/index.html", object_context, context_instance=context_instance)

def balance(request, engines, demand):
    engines = json.loads(engines)
    enabled_engines = filter(lambda engine: engine["_isEnabled"], engines)
    print enabled_engines
    if not enabled_engines:
        return HttpResponse(json.dumps(enabled_engines))
        
    vector_size = len(enabled_engines)
    rpms = variable(vector_size, "rpms")   

    fixed_engine_costs = matrix([float(EngineType.objects.get(pk=engine["_engineTypeId"]).fixed_engine_cost) for engine in enabled_engines])
    linear_engine_costs = matrix([float(EngineType.objects.get(pk=engine["_engineTypeId"]).linear_engine_cost) for engine in enabled_engines])

    fixed_energy_outputs = matrix([float(EngineType.objects.get(pk=int(engine["_engineTypeId"])).fixed_energy_output) for engine in enabled_engines])
    linear_energy_outputs = matrix([float(EngineType.objects.get(pk=int(engine["_engineTypeId"])).linear_energy_output) for engine in enabled_engines])

    minimum_rpms = matrix([float(EngineType.objects.get(pk=engine["_engineTypeId"]).minimum_rpm) for engine in enabled_engines])
    maximum_rpms = matrix([float(EngineType.objects.get(pk=engine["_engineTypeId"]).maximum_rpm) for engine in enabled_engines])

    demand_constraint = ((float(demand) - dot(rpms, linear_energy_outputs) - sum(fixed_energy_outputs)) <= 0)

    maximum_rpm_constraint = ((rpms - maximum_rpms) <= 0)
    minimum_rpm_constraint = ((rpms - minimum_rpms) >= 0)

    constraints = [demand_constraint, maximum_rpm_constraint, minimum_rpm_constraint]                
    objective_function = op((dot(linear_engine_costs, rpms) + sum(fixed_engine_costs)), constraints)        
                      
    objective_function.solve()

    print rpms.value

    rpmsIndex = 0
    for engine in engines:
        engine["_rpm"] = 0
        engine["_energyOutput"] = 0
        if engine["_isEnabled"]:
            print rpms
            if rpms.value:
                engine["_rpm"] = rpms.value[rpmsIndex]
                rpmsIndex += 1
            else:
                engine["_rpm"] = float(EngineType.objects.get(pk=engine["_engineTypeId"]).maximum_rpm)

            energy_output_per_rpm = float(EngineType.objects.get(pk=engine["_engineTypeId"]).linear_energy_output)
            base_energy_output = float(EngineType.objects.get(pk=engine["_engineTypeId"]).fixed_energy_output)
            engine["_energyOutput"] = energy_output_per_rpm * float(engine["_rpm"]) + base_energy_output      

    return HttpResponse(json.dumps(engines));