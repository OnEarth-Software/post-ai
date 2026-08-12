"""merge migration heads

Revision ID: f31ce20273b8
Revises: c200b1e7b550, d0c5481fb0d8
Create Date: 2026-08-12 19:05:21.351587

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f31ce20273b8'
down_revision: Union[str, None] = ('c200b1e7b550', 'd0c5481fb0d8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
