# views.py
import requests


def get_model_file(model: str):
    base_url = "http://localhost:11434"
    api_url = f"{base_url}/api/show"
    data = {"name": model}
    response = requests.post(api_url, json=data)
    modelfile = response.json()['modelfile']
    lines = modelfile.split('\n')
    filtered_lines = [line for line in lines if not line.lstrip().startswith('#')]
    return '\n'.join(filtered_lines)

def main():
    response = get_model_file("gemma:2b")
    print(response)
    
    
if __name__ == "__main__":
    main()