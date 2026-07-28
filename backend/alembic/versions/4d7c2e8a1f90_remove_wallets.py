"""remove wallets and transaction wallet references

Revision ID: 4d7c2e8a1f90
Revises: 201b0fa662cb
"""

from typing import Sequence, Union

from alembic import op


revision: str = "4d7c2e8a1f90"
down_revision: Union[str, Sequence[str], None] = "201b0fa662cb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove the foreign key before dropping the referenced wallet table.
    op.drop_constraint("transactions_wallet_id_fkey", "transactions", type_="foreignkey")
    op.drop_column("transactions", "wallet_id")
    op.drop_index("ix_wallets_id", table_name="wallets")
    op.drop_table("wallets")


def downgrade() -> None:
    # Downgrade recreates the old wallet structure with a zero balance.
    import sqlalchemy as sa

    op.create_table(
        "wallets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("balance", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_wallets_id", "wallets", ["id"], unique=False)
    op.add_column("transactions", sa.Column("wallet_id", sa.Integer(), nullable=True))
    op.create_foreign_key("transactions_wallet_id_fkey", "transactions", "wallets", ["wallet_id"], ["id"], ondelete="CASCADE")
