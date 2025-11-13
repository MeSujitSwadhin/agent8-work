import uuid
import re


def is_valid_uuid(val: str) -> bool:
    """
    Validates if a given value is a valid UUIDv4.
    :param val: The value to validate.
    :return: True if the value is a valid UUIDv4, otherwise False.
    """
    try:
        uuid.UUID(str(val), version=4)
        return True
    except ValueError:
        return False


def is_valid_email(email: str) -> bool:
    """Validate email format using regex."""
    email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    return bool(re.match(email_regex, email))