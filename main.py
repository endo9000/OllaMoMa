# main.py
import requests


def delete_model(model: str):
    base_url = "http://localhost:11434"
    api_url = f"{base_url}/api/delete"
    data = {"name": model}
    response = requests.delete(api_url, json=data)
    return response.status_code

def main():
    response = delete_model("gemma:2b")
    print(response)

if __name__ == "__main__":
    main()