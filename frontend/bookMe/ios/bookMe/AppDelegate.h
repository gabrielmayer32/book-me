#import <RCTAppDelegate.h>
#import <Expo/Expo.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>

@interface AppDelegate : EXAppDelegateWrapper
@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>

@end
