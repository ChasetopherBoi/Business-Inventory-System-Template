"""Add role to users

Revision ID: bddb28c1edc0
Revises: e025de80ec32
Create Date: 2026-02-10 17:20:18.888171

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bddb28c1edc0"
down_revision: Union[str, Sequence[str], None] = "e025de80ec32"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("role", sa.String(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("role")
    # ### end Alembic commands ###
