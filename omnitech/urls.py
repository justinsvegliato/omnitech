from django.conf.urls import *
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
     url(r'', include('simulator.urls')),
     url(r'^admin/', include(admin.site.urls))
)