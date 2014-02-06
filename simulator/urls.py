from django.conf.urls import *

urlpatterns = patterns('simulator.views',
    url(r'^$', 'index', name='index'),
    url(r'^engine_manager/balance/(?P<engines>.+)/(?P<demand>\d+)/$', 'balance', name='balance'),
)