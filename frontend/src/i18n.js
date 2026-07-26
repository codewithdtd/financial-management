import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Finance OS", personalFinance: "Personal Finance", dashboard: "Dashboard", transactions: "Transactions", navigation: "Navigation", close: "Close", openMenu: "Open menu", logout: "Log out", login: "Log in", register: "Create account", switchToLight: "Switch to light mode", switchToDark: "Switch to dark mode", toggleLanguage: "Change language",
      welcomeBack: "Welcome back", manageFinances: "Manage your personal finances", noAccount: "No account?", createOne: "Create one", password: "Password", email: "Email", loggingIn: "Logging in...", loginFailed: "Login failed.", createYourAccount: "Create your account", startTracking: "Start tracking your finances", confirmPassword: "Confirm password", passwordsMismatch: "Passwords do not match.", passwordLength: "Password must be at least 8 characters.", creatingAccount: "Creating account...", registrationFailed: "Registration failed.", alreadyRegistered: "Already registered?",
      totalBalance: "Total balance", income: "Income", expense: "Expense", spent: "Spent", remaining: "Remaining", cashflowHistory: "Cashflow history", monthlyCashflow: "Monthly income and expenses", spentVsRemaining: "Spent vs remaining", currentOverview: "Current overview", recentTransactions: "Recent transactions", noTransactions: "No transactions yet", addTransaction: "Add transaction", newTransaction: "New transaction", addMoneyMovement: "Add money movement", amount: "Amount", wallet: "Wallet", category: "Category", note: "Note", optionalNote: "Optional note", saveTransaction: "Save transaction", saving: "Saving...", chooseWallet: "Please choose a wallet.", chooseCategory: "Please choose a category.", amountPositive: "Amount must be greater than zero.", couldNotLoadWallets: "Could not load wallets.", couldNotSave: "Could not save transaction.", savedSuccessfully: "Saved successfully", transactionRecorded: "Your transaction was recorded.", noMatchingCategory: "No matching category"
    }
  },
  vi: {
    translation: {
      appName: "Finance OS", personalFinance: "Tài chính cá nhân", dashboard: "Tổng quan", transactions: "Giao dịch", navigation: "Điều hướng", close: "Đóng", openMenu: "Mở menu", logout: "Đăng xuất", login: "Đăng nhập", register: "Tạo tài khoản", switchToLight: "Chuyển sang giao diện sáng", switchToDark: "Chuyển sang giao diện tối", toggleLanguage: "Đổi ngôn ngữ",
      welcomeBack: "Chào mừng trở lại", manageFinances: "Quản lý tài chính cá nhân", noAccount: "Chưa có tài khoản?", createOne: "Tạo tài khoản", password: "Mật khẩu", email: "Email", loggingIn: "Đang đăng nhập...", loginFailed: "Đăng nhập thất bại.", createYourAccount: "Tạo tài khoản", startTracking: "Bắt đầu theo dõi tài chính", confirmPassword: "Xác nhận mật khẩu", passwordsMismatch: "Mật khẩu không khớp.", passwordLength: "Mật khẩu phải có ít nhất 8 ký tự.", creatingAccount: "Đang tạo tài khoản...", registrationFailed: "Đăng ký thất bại.", alreadyRegistered: "Đã có tài khoản?",
      totalBalance: "Tổng số dư", income: "Thu", expense: "Chi", spent: "Đã chi", remaining: "Còn lại", cashflowHistory: "Lịch sử dòng tiền", monthlyCashflow: "Thu chi theo tháng", spentVsRemaining: "Đã chi và còn lại", currentOverview: "Tổng quan hiện tại", recentTransactions: "Giao dịch gần đây", noTransactions: "Chưa có giao dịch", addTransaction: "Thêm giao dịch", newTransaction: "Giao dịch mới", addMoneyMovement: "Thêm dòng tiền", amount: "Số tiền", wallet: "Ví", category: "Danh mục", note: "Ghi chú", optionalNote: "Ghi chú tùy chọn", saveTransaction: "Lưu giao dịch", saving: "Đang lưu...", chooseWallet: "Vui lòng chọn ví.", chooseCategory: "Vui lòng chọn danh mục.", amountPositive: "Số tiền phải lớn hơn 0.", couldNotLoadWallets: "Không thể tải danh sách ví.", couldNotSave: "Không thể lưu giao dịch.", savedSuccessfully: "Đã lưu thành công", transactionRecorded: "Giao dịch đã được ghi nhận.", noMatchingCategory: "Không có danh mục phù hợp"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
