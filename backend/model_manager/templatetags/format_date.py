import datetime as dt
from django import template

register = template.Library()

@register.filter
def format_date(s):
    to_str = f"last modified: {s}"
    t = dt.datetime.fromisoformat(to_str[15:])

    ago = dt.datetime.now(dt.UTC)-t
    dt_str = f"{t:%Y/%m/%d} ({ago.days} days ago)"
    
    return dt_str

def main():
    response = format_date("2024-04-18T05:26:07.1559074+07:00")
    print(response)
    
if __name__ == "__main__":
    main()  