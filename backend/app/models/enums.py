# Enum giup khai bao tap gia tri hop le co dinh.
from enum import Enum


# Ke thua str de enum value hoat dong nhu string khi can serialize JSON.
# Ke thua Enum de Python biet day la enum chuan.
class FinanceType(str, Enum):
    """Allowed values for income/expense classification."""

    # Gia tri luu/thao tac cho giao dich tien vao.
    INCOME = "income"

    # Gia tri luu/thao tac cho giao dich tien ra.
    EXPENSE = "expense"
