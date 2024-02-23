from django.contrib import admin
from .models import DayOfWeek, Gig, Category, GigInstance, Booking

admin.site.register(Gig)
admin.site.register(Category)
admin.site.register(DayOfWeek)
admin.site.register(GigInstance)
admin.site.register(Booking)
