"""add prompt and completion tokens

Revision ID: d0c5481fb0d8
Revises: 397d2ad1bd6f
Create Date: 2026-08-12 16:12:31.202647

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0c5481fb0d8'
down_revision: Union[str, None] = '397d2ad1bd6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Toplam ve girdi çıktı token sütunlarını manuel ekliyoruz
    op.add_column('api_expense', sa.Column('prompt_tokens', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('api_expense', sa.Column('completion_tokens', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('api_expense', 'completion_tokens')
    op.drop_column('api_expense', 'prompt_tokens')
