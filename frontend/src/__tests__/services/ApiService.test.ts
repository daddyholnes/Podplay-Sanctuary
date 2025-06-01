/**
 * API Service Tests
 * 
 * Comprehensive test suite for API service functionality.
 * Tests HTTP client, authentication, error handling, and request/response processing.
 * 
 * @fileoverview Tests for API service functionality
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import { ApiService } from '../../services/api/ApiService';
import { AuthService } from '../../services/api/AuthService';
import { FileService } from '../../services/api/FileService';
import { 
  mockFetch, 
  createMockUser, 
  mockFileSystem,
  TEST_CONSTANTS 
} from '../utils';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('API Services', () => {
  let apiService: ApiService;
  let authService: AuthService;
  let fileService: FileService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.reset();
    
    // Initialize services
    apiService = new ApiService({
      baseURL: 'http://localhost:3000/api',
      timeout: TEST_CONSTANTS.TIMEOUTS.MEDIUM,
    });
    
    authService = new AuthService(apiService);
    fileService = new FileService(apiService);

    // Mock localStorage for auth tokens
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  // ============================================================================
  // ApiService Tests
  // ============================================================================

  describe('ApiService', () => {
    it('should initialize with correct configuration', () => {
      expect(apiService.baseURL).toBe('http://localhost:3000/api');
      expect(apiService.timeout).toBe(TEST_CONSTANTS.TIMEOUTS.MEDIUM);
    });

    it('should make GET requests correctly', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.success(mockData);

      const result = await apiService.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST requests with data', async () => {
      const postData = { name: 'New Item', description: 'Test item' };
      const responseData = { id: 1, ...postData };
      mockFetch.success(responseData);

      const result = await apiService.post('/items', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/items',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('should handle PUT and PATCH requests', async () => {
      const updateData = { name: 'Updated Item' };
      const responseData = { id: 1, ...updateData };
      mockFetch.success(responseData);

      const putResult = await apiService.put('/items/1', updateData);
      const patchResult = await apiService.patch('/items/1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/items/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/items/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );

      expect(putResult).toEqual(responseData);
      expect(patchResult).toEqual(responseData);
    });

    it('should handle DELETE requests', async () => {
      mockFetch.success({ success: true });

      const result = await apiService.delete('/items/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should add authentication headers when token is available', async () => {
      const token = 'test-auth-token';
      (window.localStorage.getItem as jest.Mock).mockReturnValue(token);

      mockFetch.success({ data: 'test' });

      await apiService.get('/protected');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );
    });

    it('should handle request timeouts', async () => {
      // Mock a timeout scenario
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, TEST_CONSTANTS.TIMEOUTS.LONG))
      );

      const quickApiService = new ApiService({
        baseURL: 'http://localhost:3000/api',
        timeout: 100, // Very short timeout
      });

      await expect(quickApiService.get('/slow-endpoint')).rejects.toThrow('timeout');
    });

    it('should handle network errors', async () => {
      mockFetch.networkError();

      await expect(apiService.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.error(404, 'Not Found');

      await expect(apiService.get('/nonexistent')).rejects.toThrow();
    });

    it('should retry failed requests', async () => {
      // First call fails, second succeeds
      mockFetch.error(500, 'Server Error');
      mockFetch.success({ data: 'success' });

      const retryApiService = new ApiService({
        baseURL: 'http://localhost:3000/api',
        retries: 1,
      });

      const result = await retryApiService.get('/flaky-endpoint');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'success' });
    });

    it('should use request interceptors', async () => {
      const interceptor = jest.fn((config) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test-value',
        },
      }));

      apiService.addRequestInterceptor(interceptor);
      mockFetch.success({ data: 'test' });

      await apiService.get('/test');

      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value',
          }),
        })
      );
    });

    it('should use response interceptors', async () => {
      const responseInterceptor = jest.fn((response) => ({
        ...response,
        intercepted: true,
      }));

      apiService.addResponseInterceptor(responseInterceptor);
      mockFetch.success({ data: 'test' });

      const result = await apiService.get('/test');

      expect(responseInterceptor).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          intercepted: true,
        })
      );
    });
  });

  // ============================================================================
  // AuthService Tests
  // ============================================================================

  describe('AuthService', () => {
    it('should login with credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = createMockUser({ email: credentials.email });
      const authResponse = {
        user: mockUser,
        token: 'auth-token-123',
        refreshToken: 'refresh-token-123',
      };

      mockFetch.success(authResponse);

      const result = await authService.login(credentials);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(credentials),
        })
      );

      expect(result).toEqual(authResponse);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        authResponse.token
      );
    });

    it('should register new user', async () => {
      const registrationData = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
        displayName: 'New User',
      };

      const mockUser = createMockUser(registrationData);
      const authResponse = {
        user: mockUser,
        token: 'auth-token-123',
      };

      mockFetch.success(authResponse);

      const result = await authService.register(registrationData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registrationData),
        })
      );

      expect(result).toEqual(authResponse);
    });

    it('should logout and clear tokens', async () => {
      mockFetch.success({ success: true });

      await authService.logout();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should refresh authentication token', async () => {
      const newToken = 'new-auth-token-456';
      (window.localStorage.getItem as jest.Mock).mockReturnValue('old-refresh-token');
      mockFetch.success({ token: newToken });

      const result = await authService.refreshToken();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            refreshToken: 'old-refresh-token',
          }),
        })
      );

      expect(result).toBe(newToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', newToken);
    });

    it('should get current user profile', async () => {
      const mockUser = createMockUser();
      (window.localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
      mockFetch.success(mockUser);

      const result = await authService.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const updates = {
        displayName: 'Updated Name',
        avatar: 'new-avatar-url.jpg',
      };

      const updatedUser = createMockUser(updates);
      mockFetch.success(updatedUser);

      const result = await authService.updateProfile(updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/profile',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );

      expect(result).toEqual(updatedUser);
    });

    it('should handle password reset', async () => {
      const email = 'user@example.com';
      mockFetch.success({ success: true, message: 'Reset email sent' });

      const result = await authService.requestPasswordReset(email);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/password-reset',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email }),
        })
      );

      expect(result.success).toBe(true);
    });

    it('should reset password with token', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
      };

      mockFetch.success({ success: true });

      const result = await authService.resetPassword(resetData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/password-reset/confirm',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(resetData),
        })
      );

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // FileService Tests
  // ============================================================================

  describe('FileService', () => {
    it('should upload files with progress tracking', async () => {
      const file = mockFileSystem.createFile('test.txt', 'Test content');
      const uploadResponse = {
        id: 'file-123',
        url: '/uploads/test.txt',
        name: file.name,
        size: file.size,
      };

      mockFetch.success(uploadResponse);

      const progressCallback = jest.fn();
      const result = await fileService.uploadFile(file, {
        onProgress: progressCallback,
        destination: '/uploads/',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/files/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(result).toEqual(uploadResponse);
    });

    it('should upload multiple files', async () => {
      const files = [
        mockFileSystem.createFile('file1.txt', 'Content 1'),
        mockFileSystem.createFile('file2.txt', 'Content 2'),
      ];

      const uploadResponse = {
        files: files.map((file, index) => ({
          id: `file-${index + 1}`,
          name: file.name,
          size: file.size,
        })),
      };

      mockFetch.success(uploadResponse);

      const result = await fileService.uploadMultipleFiles(files);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/files/upload/multiple',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(result.files).toHaveLength(2);
    });

    it('should download files', async () => {
      const fileId = 'file-123';
      const mockBlob = new Blob(['file content'], { type: 'text/plain' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        headers: new Headers({
          'Content-Disposition': 'attachment; filename="test.txt"',
        }),
      });

      // Mock URL.createObjectURL
      const mockObjectURL = 'blob:mock-url';
      global.URL.createObjectURL = jest.fn(() => mockObjectURL);

      const result = await fileService.downloadFile(fileId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/files/${fileId}/download`,
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual({
        blob: mockBlob,
        filename: 'test.txt',
        url: mockObjectURL,
      });
    });

    it('should get file metadata', async () => {
      const fileId = 'file-123';
      const metadata = {
        id: fileId,
        name: 'test.txt',
        size: 1024,
        type: 'text/plain',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockFetch.success(metadata);

      const result = await fileService.getFileMetadata(fileId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/files/${fileId}/metadata`,
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(metadata);
    });

    it('should delete files', async () => {
      const fileId = 'file-123';
      mockFetch.success({ success: true });

      const result = await fileService.deleteFile(fileId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/files/${fileId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result.success).toBe(true);
    });

    it('should handle file upload errors', async () => {
      const file = mockFileSystem.createFile('large.txt', 'x'.repeat(10000000)); // Large file
      mockFetch.error(413, 'File too large');

      await expect(
        fileService.uploadFile(file)
      ).rejects.toThrow('File too large');
    });

    it('should handle upload progress', async () => {
      const file = mockFileSystem.createFile('test.txt', 'Test content');
      const progressCallback = jest.fn();

      // Mock XMLHttpRequest for progress tracking
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        upload: {
          addEventListener: jest.fn((event, callback) => {
            if (event === 'progress') {
              // Simulate progress events
              setTimeout(() => callback({ loaded: 50, total: 100 }), 10);
              setTimeout(() => callback({ loaded: 100, total: 100 }), 20);
            }
          }),
        },
        addEventListener: jest.fn((event, callback) => {
          if (event === 'load') {
            setTimeout(() => {
              (mockXHR as any).status = 200;
              (mockXHR as any).responseText = JSON.stringify({
                id: 'file-123',
                name: file.name,
              });
              callback();
            }, 30);
          }
        }),
      };

      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      const result = await fileService.uploadFileWithXHR(file, {
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          loaded: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        })
      );
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('API Services Integration', () => {
    it('should handle authentication flow with API calls', async () => {
      // Login
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const authResponse = {
        user: createMockUser({ email: credentials.email }),
        token: 'auth-token-123',
      };

      mockFetch.success(authResponse);
      await authService.login(credentials);

      // Make authenticated API call
      mockFetch.success({ data: 'protected data' });
      const result = await apiService.get('/protected-endpoint');

      expect(global.fetch).toHaveBeenLastCalledWith(
        'http://localhost:3000/api/protected-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${authResponse.token}`,
          }),
        })
      );

      expect(result).toEqual({ data: 'protected data' });
    });

    it('should handle token refresh on 401 errors', async () => {
      // Set up initial token
      (window.localStorage.getItem as jest.Mock)
        .mockReturnValueOnce('expired-token')
        .mockReturnValueOnce('refresh-token-123');

      // First call returns 401
      mockFetch.error(401, 'Unauthorized');
      
      // Refresh token call
      mockFetch.success({ token: 'new-token-456' });
      
      // Retry original call with new token
      mockFetch.success({ data: 'success' });

      const result = await apiService.get('/protected-endpoint');

      expect(global.fetch).toHaveBeenCalledTimes(3); // Original, refresh, retry
      expect(result).toEqual({ data: 'success' });
    });
  });
});
