# from django.conf import settings

# from django.db.models.signals import post_save
# import datetime

# from django.dispatch import receiver



# from django.db import models

# from datetime import timedelta

# from .models import Gig, GigInstance
# import logging
# from django.db import transaction

# logger = logging.getLogger(__name__)

# @receiver(post_save, sender=Gig)
# def generate_gig_instances(sender, instance, created, **kwargs):
#     if not created:
#         return  # Skip if not a new Gig creation

#     # Defer the execution of the instance generation logic until after the transaction commits
#     def _post_save_action():
#         print("Creating gig instances")
#         if instance.is_recurring:
#             start_date = datetime.date.today()
#             print(instance.recurring_days.all())
#             for day in instance.recurring_days.all():
#                 day_num = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].index(day.name)
#                 days_until_next = (day_num - start_date.weekday() + 7) % 7
#                 if days_until_next == 0:
#                     days_until_next = 7
#                 next_day = start_date + datetime.timedelta(days=days_until_next)
#                 print(next_day)
#                 print(instance.start_time)
#                 print(instance.end_time)
#                 print(instance.title)
#                 for week in range(12):
#                     gig_date = next_day + datetime.timedelta(weeks=week)
#                     try:
#                         GigInstance.objects.create(
#                             gig=instance,
#                             date=gig_date,
#                             start_time=instance.start_time,
#                             end_time=instance.end_time
#                         )
#                         logger.debug(f"Created gig instance for {gig_date}")
#                     except Exception as e:
#                         logger.error(f"Failed to create gig instance: {e}")
#     transaction.on_commit(_post_save_action)
