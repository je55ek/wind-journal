"""create users table

Revision ID: e4f8353f11e4
Revises: 
Create Date: 2025-09-11 08:01:58.155665

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4f8353f11e4'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key = True),
        sa.Column("admin", sa.Boolean(), nullable = False),
        sa.Column("email", sa.Text(), nullable = False),
        sa.Column("name", sa.Text(), nullable = False),
        sa.Column("hashed_password", sa.Text(), nullable = False)
    )
    op.create_index("email_index", "users", ["email"], unique = True)


def downgrade():
    op.drop_table("users")
