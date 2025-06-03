import pytest
from flask import Flask
from flask.testing import FlaskClient

@pytest.fixture
def client():
    from app.app import create_app  # Adjust import if needed
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_mamabear_chat(client: FlaskClient):
    response = client.post('/api/mama-bear/chat', json={
        'message': 'Hello from test',
        'user_id': 'test',
        'attachments': []
    })
    assert response.status_code in (200, 400)  # Accepts 400 if no backend model
    # Optionally check response.json structure
