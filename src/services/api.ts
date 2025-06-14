// API service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://stocknote-backend.onrender.com/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    
    // Check if response is HTML (likely an error page)
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Backend returned HTML instead of JSON. Server may be down or misconfigured.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Check if it's an email verification error
        if (data.requiresEmailVerification) {
          const error = new Error(data.message || 'Email verification required') as any;
          error.requiresEmailVerification = true;
          error.email = data.email;
          throw error;
        }
        
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        throw new Error('Session expired. Please login again.');
      }
      
      // Return the error with additional data for email verification
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`) as any;
      error.requiresEmailVerification = data.requiresEmailVerification;
      error.email = data.email;
      error.errors = data.errors; // Include validation errors
      throw error;
    }
    
    return data;
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    try {
      const headers = this.getAuthHeaders();
      
      // Debug: Log the request details
      console.log('Making API request:', {
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        hasToken: !!localStorage.getItem('authToken'),
        headers: headers
      });
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API Request failed: ${url}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      console.log('Token stored:', data.data.token.substring(0, 20) + '...');
    }
    
    return data;
  }

  async signup(name: string, email: string, password: string) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async verifyEmail(email: string, token: string) {
    const data = await this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, token })
    });
    
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      console.log('Token stored after verification:', data.data.token.substring(0, 20) + '...');
    }
    
    return data;
  }

  async resendVerificationEmail(email: string) {
    return this.makeRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword })
    });
  }

  async logout() {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  async checkAuthStatus() {
    return this.makeRequest('/auth/status');
  }

  // Journal Entries (Trades)
  async getJournalEntries(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.makeRequest(`/journal-entries${queryString ? `?${queryString}` : ''}`);
  }

  async createJournalEntry(entryData: any) {
    // Debug: Log the data being sent
    console.log('Creating journal entry with data:', entryData);
    console.log('Current auth token exists:', !!localStorage.getItem('authToken'));
    
    return this.makeRequest('/journal-entries', {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
  }

  async updateJournalEntry(id: string, entryData: any) {
    return this.makeRequest(`/journal-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData)
    });
  }

  async deleteJournalEntry(id: string) {
    return this.makeRequest(`/journal-entries/${id}`, {
      method: 'DELETE'
    });
  }

  async getJournalStats() {
    return this.makeRequest('/journal-entries/stats');
  }

  async getMonthlyPerformance(year: number) {
    return this.makeRequest(`/journal-entries/monthly/${year}`);
  }

  // Focus Stocks
  async getFocusStocks(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.makeRequest(`/focus-stocks${queryString ? `?${queryString}` : ''}`);
  }

  async createFocusStock(stockData: any) {
    return this.makeRequest('/focus-stocks', {
      method: 'POST',
      body: JSON.stringify(stockData)
    });
  }

  async updateFocusStock(id: string, stockData: any) {
    return this.makeRequest(`/focus-stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData)
    });
  }

  async deleteFocusStock(id: string) {
    return this.makeRequest(`/focus-stocks/${id}`, {
      method: 'DELETE'
    });
  }

  async markFocusStockTaken(id: string, tradeTaken: boolean, tradeDate?: string) {
    return this.makeRequest(`/focus-stocks/${id}/mark-taken`, {
      method: 'PATCH',
      body: JSON.stringify({ tradeTaken, tradeDate })
    });
  }

  async getFocusStockStats() {
    return this.makeRequest('/focus-stocks/stats');
  }

  async getPendingFocusStocks() {
    return this.makeRequest('/focus-stocks/pending');
  }

  // Teams
  async getTeams() {
    return this.makeRequest('/teams');
  }

  async createTeam(teamData: any) {
    return this.makeRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async getTeam(id: string) {
    return this.makeRequest(`/teams/${id}`);
  }

  async updateTeam(id: string, teamData: any) {
    return this.makeRequest(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData)
    });
  }

  async addTeamMember(teamId: string, userEmail: string, role: string = 'member') {
    return this.makeRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userEmail, role })
    });
  }

  async removeTeamMember(teamId: string, userId: string) {
    return this.makeRequest(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  }

  async getTeamStats(teamId: string) {
    return this.makeRequest(`/teams/${teamId}/stats`);
  }

  // Team Trades
  async getTeamTrades(teamId: string, params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.makeRequest(`/team-trades/team/${teamId}${queryString ? `?${queryString}` : ''}`);
  }

  async createTeamTrade(tradeData: any) {
    return this.makeRequest('/team-trades', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
  }

  async updateTeamTrade(id: string, tradeData: any) {
    return this.makeRequest(`/team-trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tradeData)
    });
  }

  async deleteTeamTrade(id: string) {
    return this.makeRequest(`/team-trades/${id}`, {
      method: 'DELETE'
    });
  }

  async voteOnTeamTrade(tradeId: string, vote: string, comment?: string) {
    return this.makeRequest(`/team-trades/${tradeId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote, comment })
    });
  }

  async getTeamTradeStats(teamId: string) {
    return this.makeRequest(`/team-trades/team/${teamId}/stats`);
  }

  async getTeamMonthlyPerformance(teamId: string, year: number) {
    return this.makeRequest(`/team-trades/team/${teamId}/monthly/${year}`);
  }

  // Books
  async getBooks(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.makeRequest(`/books${queryString ? `?${queryString}` : ''}`);
  }

  async getBook(id: string) {
    return this.makeRequest(`/books/${id}`);
  }

  async getPopularBooks(limit: number = 10) {
    return this.makeRequest(`/books/popular?limit=${limit}`);
  }

  async searchBooks(query: string, options?: any) {
    const params = new URLSearchParams({ q: query, ...options });
    return this.makeRequest(`/books/search?${params.toString()}`);
  }

  async rateBook(bookId: string, rating: number, review?: string) {
    return this.makeRequest(`/books/${bookId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review })
    });
  }

  // User Profile
  async getUserProfile() {
    return this.makeRequest('/auth/me');
  }

  async updateUserProfile(profileData: any) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.makeRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  }

  async deleteAccount(password: string) {
    return this.makeRequest('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirmDelete: 'DELETE' })
    });
  }

  async getDashboardData() {
    return this.makeRequest('/users/dashboard');
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const contentType = response.headers.get('content-type');
      
      // Check if response is HTML (likely an error page)
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Backend returned HTML instead of JSON. Server may be down or misconfigured.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;