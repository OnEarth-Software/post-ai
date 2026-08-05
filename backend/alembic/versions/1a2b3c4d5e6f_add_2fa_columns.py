"""add 2fa columns

Revision ID: 1a2b3c4d5e6f
Revises: e7845e479f06
Create Date: 2026-08-04 21:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = 'e7845e479f06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_2fa_enabled', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('two_factor_secret', sa.String(), nullable=True))
    op.execute("UPDATE users SET is_2fa_enabled = false")


def downgrade() -> None:
    op.drop_column('users', 'two_factor_secret')
    op.drop_column('users', 'is_2fa_enabled')
