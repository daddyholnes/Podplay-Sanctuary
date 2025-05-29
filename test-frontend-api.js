// Test frontend API call to Mama Bear
async function testMamaBearAPI() {
  const API_BASE_URL = 'http://localhost:5000';
  const endpoint = '/api/mama-bear/chat';
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('Testing URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello from JavaScript test',
        user_id: 'nathan',
        attachments: []
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ SUCCESS: API call working!');
      console.log('Mama Bear response:', data.response);
    } else {
      console.log('❌ FAILED: API returned error');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error);
  }
}

// Run the test
testMamaBearAPI();
