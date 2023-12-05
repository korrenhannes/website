import requests

def check_signed_urls(signed_urls):
    for url in signed_urls:
        response = requests.get(url)
        if response.status_code == 200:
            print(f"Success: {url}")
        else:
            print(f"Failed ({response.status_code}): {url}")

# Example usage
if __name__ == '__main__':
    # Replace this with the actual list of signed URLs you retrieve from your backend
    signed_urls_example = [
        'http://example.com/signed-url-1',
        'http://example.com/signed-url-2',
        # Add more signed URLs here
    ]

    check_signed_urls(signed_urls_example)
