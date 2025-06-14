// API service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    const data = await this.handleResponse(response);
    
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
    }
    
    return data;
  }

  async signup(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    
    return this.handleResponse(response);
  }

  async verifyEmail(email: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, token })
    });
    
    const data = await this.handleResponse(response);
    
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
    }
    
    return data;
  }

  async logout() {
    localStorage.removeItem('authToken');
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      // Logout locally even if server request fails
      console.warn('Logout request failed:', error);
    }
  }

  // Journal Entries (Trades)
  async getJournalEntries(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/journal-entries?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createJournalEntry(entryData: any) {
    const response = await fetch(`${API_BASE_URL}/journal-entries`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(entryData)
    });
    
    return this.handleResponse(response);
  }

  async updateJournalEntry(id: string, entryData: any) {
    const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(entryData)
    });
    
    return this.handleResponse(response);
  }

  async deleteJournalEntry(id: string) {
    const response = await fetch(`${API_BASE_URL}/journal-entries/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getJournalStats() {
    const response = await fetch(`${API_BASE_URL}/journal-entries/stats`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Focus Stocks
  async getFocusStocks(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/focus-stocks?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createFocusStock(stockData: any) {
    const response = await fetch(`${API_BASE_URL}/focus-stocks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(stockData)
    });
    
    return this.handleResponse(response);
  }

  async updateFocusStock(id: string, stockData: any) {
    const response = await fetch(`${API_BASE_URL}/focus-stocks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(stockData)
    });
    
    return this.handleResponse(response);
  }

  async deleteFocusStock(id: string) {
    const response = await fetch(`${API_BASE_URL}/focus-stocks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async markFocusStockTaken(id: string, tradeTaken: boolean, tradeDate?: string) {
    const response = await fetch(`${API_BASE_URL}/focus-stocks/${id}/mark-taken`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ tradeTaken, tradeDate })
    });
    
    return this.handleResponse(response);
  }

  async getFocusStockStats() {
    const response = await fetch(`${API_BASE_URL}/focus-stocks/stats`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  // Teams
  async getTeams() {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createTeam(teamData: any) {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(teamData)
    });
    
    return this.handleResponse(response);
  }

  async getTeam(id: string) {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async addTeamMember(teamId: string, userEmail: string, role: string = 'member') {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userEmail, role })
    });
    
    return this.handleResponse(response);
  }

  // Team Trades
  async getTeamTrades(teamId: string, params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/team-trades/team/${teamId}?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async createTeamTrade(tradeData: any) {
    const response = await fetch(`${API_BASE_URL}/team-trades`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tradeData)
    });
    
    return this.handleResponse(response);
  }

  async voteOnTeamTrade(tradeId: string, vote: string, comment?: string) {
    const response = await fetch(`${API_BASE_URL}/team-trades/${tradeId}/vote`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ vote, comment })
    });
    
    return this.handleResponse(response);
  }

  // Books
  async getBooks(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/books?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async rateBook(bookId: string, rating: number, review?: string) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/rate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rating, review })
    });
    
    return this.handleResponse(response);
  }

  // User Profile
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async updateUserProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    
    return this.handleResponse(response);
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    
    return this.handleResponse(response);
  }

  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;