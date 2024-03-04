import requests

def send_push_notification(expo_push_token, title, message, target):
    # Expo push notification endpoint
    url = 'https://exp.host/--/api/v2/push/send'
    
    # Headers for the request
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    
    # Payload for the request
    payload = {
        'to': expo_push_token,
        'title': title,
        'body': message,
        "data": target

    }
    
    # Making the POST request to the Expo push notification service
    response = requests.post(url, json=payload, headers=headers)
    print(response.json())

    # You may want to check the response and handle any errors
    if response.status_code == 200:
        print("Notification sent successfully")
    else:
        print(f"Failed to send notification, status code: {response.status_code}")
    
    return response.json()  # Returning the response for further inspection if necessary
