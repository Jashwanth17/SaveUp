export interface UserAccount {
  username: string;
  password: string;
  recoveryPin: string;
  createdAt: string;
}

const STORAGE_KEY = 'saveup_accounts';
const ACTIVE_USER_KEY = 'saveup_active_user';

const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    username: 'jashwanth',
    password: 'password123',
    recoveryPin: '1234',
    createdAt: new Date().toISOString(),
  },
  {
    username: 'demo',
    password: 'demo123',
    recoveryPin: '9999',
    createdAt: new Date().toISOString(),
  },
];

export const authService = {
  getAccounts(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  isUsernameTaken(username: string): boolean {
    const accounts = this.getAccounts();
    return accounts.some(acc => acc.username.toLowerCase() === username.trim().toLowerCase());
  },

  createAccount(username: string, password: string, recoveryPin: string): { success: boolean; error?: string } {
    const trimmedUser = username.trim();
    const trimmedPin = recoveryPin.trim();

    if (!trimmedUser) return { success: false, error: 'Username is required.' };
    if (!password) return { success: false, error: 'Password is required.' };
    if (!trimmedPin || !/^\d{4}$/.test(trimmedPin)) {
      return { success: false, error: 'Recovery PIN must be exactly 4 digits.' };
    }

    if (this.isUsernameTaken(trimmedUser)) {
      return { success: false, error: 'Username is already taken. Please choose a different username.' };
    }

    const newAccount: UserAccount = {
      username: trimmedUser,
      password,
      recoveryPin: trimmedPin,
      createdAt: new Date().toISOString(),
    };

    const accounts = this.getAccounts();
    accounts.push(newAccount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));

    return { success: true };
  },

  login(username: string, password: string): { success: boolean; account?: UserAccount; error?: string } {
    const trimmedUser = username.trim();
    const accounts = this.getAccounts();
    const found = accounts.find(acc => acc.username.toLowerCase() === trimmedUser.toLowerCase());

    if (!found) {
      return { success: false, error: 'No account found with this username.' };
    }

    if (found.password !== password) {
      return { success: false, error: 'Incorrect password. Use Forgot Password if you need to reset.' };
    }

    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
    localStorage.setItem('saveup_user_name', found.username);
    return { success: true, account: found };
  },

  resetPasswordWithUsernameOrPin(username: string, recoveryPin: string, newPassword: string): { success: boolean; error?: string } {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPin = recoveryPin.trim();

    if (!trimmedUser && !trimmedPin) {
      return { success: false, error: 'Please enter either your Username or your Recovery PIN.' };
    }

    if (!newPassword) {
      return { success: false, error: 'New password cannot be empty.' };
    }

    const accounts = this.getAccounts();
    let index = -1;

    if (trimmedUser && trimmedPin) {
      // Both provided: verify both match the same account
      index = accounts.findIndex(acc => acc.username.toLowerCase() === trimmedUser && acc.recoveryPin === trimmedPin);
      if (index === -1) {
        return { success: false, error: 'Username and Recovery PIN do not match records on this device.' };
      }
    } else if (trimmedUser) {
      // Username only
      index = accounts.findIndex(acc => acc.username.toLowerCase() === trimmedUser);
      if (index === -1) {
        return { success: false, error: 'No account found with this username.' };
      }
    } else if (trimmedPin) {
      // Recovery PIN only
      index = accounts.findIndex(acc => acc.recoveryPin === trimmedPin);
      if (index === -1) {
        return { success: false, error: 'No account found with this Recovery PIN.' };
      }
    }

    accounts[index].password = newPassword;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return { success: true };
  },

  resetPasswordWithPin(username: string, recoveryPin: string, newPassword: string): { success: boolean; error?: string } {
    return this.resetPasswordWithUsernameOrPin(username, recoveryPin, newPassword);
  },

  getActiveUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
};
