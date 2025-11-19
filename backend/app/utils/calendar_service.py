from datetime import datetime
import json
import os
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    service_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    info = json.loads(service_json)
    creds = Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("calendar", "v3", credentials=creds)

def convert_to_google_datetime(date_str, time_str):
    """
    Supported time formats:
        15:00
        15:00:00
        9:00 AM
        9:00:00 AM
        09:00
        09:00:00
    """

    date_str = date_str.strip()
    time_str = time_str.strip()

    # Try 24-hour formats
    formats_24 = ["%H:%M", "%H:%M:%S"]
    for fmt in formats_24:
        try:
            dt = datetime.strptime(f"{date_str} {time_str}", f"%m/%d/%Y {fmt}")
            return dt.strftime("%Y-%m-%dT%H:%M:%S")
        except:
            pass

    # Try 12-hour (AM/PM) formats
    formats_12 = ["%I:%M %p", "%I:%M:%S %p"]
    for fmt in formats_12:
        try:
            dt = datetime.strptime(f"{date_str} {time_str}", f"%m/%d/%Y {fmt}")
            return dt.strftime("%Y-%m-%dT%H:%M:%S")
        except:
            pass

    raise ValueError(f"Unsupported date/time format: '{date_str} {time_str}'")



def create_event(row):
    service = get_calendar_service()

    start_dt = convert_to_google_datetime(row.selectDate, row.time)

    event_body = {
        "summary": row.topic,
        "description": json.dumps({
            "topic": row.topic,
            "imageGenerated": row.imageGenerated
        }),
        "start": {
            "dateTime": start_dt,
            "timeZone": "Asia/Kolkata"
        },
        "end": {
            "dateTime": start_dt,  # same time (0 min event)
            "timeZone": "Asia/Kolkata"
        }
    }

    return service.events().insert(
        calendarId="d18d761e4749765908414d4d8e410e24e0c3cc94ab31d230a5a1c67051fcb8a7@group.calendar.google.com",
        body=event_body
    ).execute()
