import httpx
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing /health...")
    response = httpx.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Body: {response.json()}")

def test_auth_flow(email, password):
    print(f"\nTesting Auth Flow for {email}...")
    
    # Login
    print("Logging in...")
    login_data = {"email": email, "password": password}
    response = httpx.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return None
    
    token = response.json()["access_token"]
    print("Login successful!")
    return token

def test_history_crud(token):
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get History
    print("\nFetching history...")
    response = httpx.get(f"{BASE_URL}/history", headers=headers)
    data = response.json()
    items = data.get("items", [])
    
    if not items:
        print("No predictions found in history to test CRUD. Please run a prediction first.")
        return

    target_id = items[0]["id"]
    print(f"Targeting prediction ID: {target_id}")

    # 2. Update (Patch)
    print(f"Updating prediction {target_id}...")
    update_data = {"image_filename": "updated_test_image.jpg"}
    patch_resp = httpx.patch(f"{BASE_URL}/history/{target_id}", json=update_data, headers=headers)
    print(f"Patch Status: {patch_resp.status_code}")
    if patch_resp.status_code == 200:
        print(f"New filename: {patch_resp.json()['image_filename']}")

    # 3. Delete
    print(f"Deleting prediction {target_id}...")
    del_resp = httpx.delete(f"{BASE_URL}/history/{target_id}", headers=headers)
    print(f"Delete Status: {del_resp.status_code}")
    if del_resp.status_code == 204:
        print("Successfully deleted!")

if __name__ == "__main__":
    # Example usage: python test_api.py user@example.com password123
    test_health()
    
    if len(sys.argv) == 3:
        email = sys.argv[1]
        password = sys.argv[2]
        token = test_auth_flow(email, password)
        test_history_crud(token)
    else:
        print("\nTo test Auth/CRUD, run: python test_api.py <email> <password>")
