from django.contrib import admin
from .models import DayOfWeek, Gig, Category, GigInstance

admin.site.register(Gig)
admin.site.register(Category)
admin.site.register(DayOfWeek)
admin.site.register(GigInstance)